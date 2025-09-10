import { Prisma, PrismaClient, OrderStatus, RatingType } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import * as ratingService from '../services/rating.service';
import * as ratingModel from '../models/rating.model';
import * as orderModel from '../models/order.model';
import { RatingError } from '../services/rating.service';

// Mock the models to isolate the service layer for testing
jest.mock('../models/rating.model');
jest.mock('../models/order.model');

// Mock the PrismaClient to control its behavior in tests, especially for transactions
const prismaMock = mockDeep<PrismaClient>();
jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  PrismaClient: jest.fn(() => prismaMock),
}));

describe('Rating Service', () => {
  // Create typed mocks of the imported models
  const mockRatingModel = ratingModel as jest.Mocked<typeof ratingModel>;
  const mockOrderModel = orderModel as jest.Mocked<typeof orderModel>;

  // Reset mocks before each test to ensure a clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRatingService', () => {
    const raterId = 'customer-123';
    const orderId = 'order-abc';
    const vendorId = 'vendor-xyz';

    // A standard mock order object that represents a valid state for rating
    const mockOrder = {
      id: orderId,
      userId: raterId,
      vendorId: vendorId,
      orderStatus: OrderStatus.delivered,
      shopperId: 'shopper-456',
      deliveryPersonId: 'deliverer-789',
    } as any;

    const createVendorRatingPayload: Omit<ratingModel.CreateRatingPayload, 'raterId'> = {
      orderId,
      type: RatingType.VENDOR,
      rating: 5,
      comment: 'Great service!',
    };

    it('should create a VENDOR rating successfully', async () => {
      mockOrderModel.getOrderById.mockResolvedValue(mockOrder);

      // Mock the Prisma transaction to simulate a successful database operation
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = { rating: { findUnique: jest.fn().mockResolvedValue(null) } } as any;
        mockRatingModel.createRating.mockResolvedValueOnce({
          id: 'rating-1',
          ...createVendorRatingPayload,
          raterId,
          ratedVendorId: vendorId,
          ratedUserId: null,
          comment: createVendorRatingPayload.comment ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return callback(tx);
      });

      const result = await ratingService.createRatingService(raterId, createVendorRatingPayload);

      expect(mockOrderModel.getOrderById).toHaveBeenCalledWith(orderId);
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(mockRatingModel.createRating).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createVendorRatingPayload,
          raterId,
          ratedVendorId: vendorId,
        }),
        expect.anything() // The transaction client
      );
      expect(result).toBeDefined();
      expect(result.rating).toBe(5);
      expect(result.type).toBe(RatingType.VENDOR);
    });

    it('should throw a 404 error if order is not found', async () => {
      mockOrderModel.getOrderById.mockResolvedValue(null);
      await expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
        .rejects.toThrow(new RatingError('Order not found.', 404));
    });

    it('should throw a 403 error if user is not authorized to rate the order', async () => {
      mockOrderModel.getOrderById.mockResolvedValue({ ...mockOrder, userId: 'another-user' });
      await expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
        .rejects.toThrow(new RatingError('You are not authorized to rate this order.', 403));
    });

    it('should throw a 400 error if order is not delivered', async () => {
      mockOrderModel.getOrderById.mockResolvedValue({ ...mockOrder, orderStatus: OrderStatus.pending });
      await expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
        .rejects.toThrow(new RatingError('Order must be delivered before it can be rated.', 400));
    });

    it('should throw a 400 error for an invalid rating value', async () => {
      const invalidPayload = { ...createVendorRatingPayload, rating: 6 };
      mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
      await expect(ratingService.createRatingService(raterId, invalidPayload))
        .rejects.toThrow(new RatingError('Rating must be between 1 and 5.', 400));
    });

    it('should throw a 409 error if a rating of the same type already exists', async () => {
      mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
      
      // Mock transaction to simulate finding an existing rating
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = { rating: { findUnique: jest.fn().mockResolvedValue({ id: 'existing-rating' }) } } as any;
        return callback(tx);
      });

      await expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
        .rejects.toThrow(new RatingError('A vendor rating for this order already exists.', 409));
    });

    it('should correctly assign ratedUserId for a SHOPPER rating', async () => {
        const shopperRatingPayload = { ...createVendorRatingPayload, type: RatingType.SHOPPER };
        mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
        
        prismaMock.$transaction.mockImplementation(async (callback: any) => {
            const tx = { rating: { findUnique: jest.fn().mockResolvedValue(null) } } as any;
            return callback(tx);
        });

        await ratingService.createRatingService(raterId, shopperRatingPayload);

        expect(mockRatingModel.createRating).toHaveBeenCalledWith(
            expect.objectContaining({
                ratedUserId: mockOrder.shopperId,
                ratedVendorId: undefined,
            }),
            expect.anything()
        );
    });

    it('should throw a 400 error if trying to rate a shopper on an order without one', async () => {
        const shopperRatingPayload = { ...createVendorRatingPayload, type: RatingType.SHOPPER };
        mockOrderModel.getOrderById.mockResolvedValue({ ...mockOrder, shopperId: null });

        await expect(ratingService.createRatingService(raterId, shopperRatingPayload))
            .rejects.toThrow(new RatingError('This order does not have an assigned shopper to rate.', 400));
    });
  });

  describe('updateRatingService', () => {
    const ratingId = 'rating-1';
    const raterId = 'customer-123';
    const updatePayload = { comment: 'Updated comment' };
    const existingRating = { id: ratingId, raterId: raterId } as any;

    it('should update a rating successfully', async () => {
        mockRatingModel.getRatingById.mockResolvedValue(existingRating);
        mockRatingModel.updateRating.mockResolvedValue({ ...existingRating, ...updatePayload });

        const result = await ratingService.updateRatingService(ratingId, raterId, updatePayload);

        expect(mockRatingModel.getRatingById).toHaveBeenCalledWith(ratingId);
        expect(mockRatingModel.updateRating).toHaveBeenCalledWith(ratingId, updatePayload);
        expect(result.comment).toBe('Updated comment');
    });

    it('should throw a 403 error if user is not authorized to update the rating', async () => {
        mockRatingModel.getRatingById.mockResolvedValue(existingRating);
        await expect(ratingService.updateRatingService(ratingId, 'another-user-id', updatePayload))
            .rejects.toThrow(new RatingError('You are not authorized to update this rating.', 403));
    });
  });

  describe('getAggregateRatingService', () => {
    it('should get aggregate rating for a vendor', async () => {
        const aggregateData = { average: 4.5, count: 10 };
        mockRatingModel.getAggregateRating.mockResolvedValue(aggregateData);

        const result = await ratingService.getAggregateRatingService({ ratedVendorId: 'vendor-1' });
        
        expect(mockRatingModel.getAggregateRating).toHaveBeenCalledWith({ ratedVendorId: 'vendor-1' });
        expect(result).toEqual(aggregateData);
    });

    it('should throw an error if no ID is provided', async () => {
        await expect(ratingService.getAggregateRatingService({}))
            .rejects.toThrow(new RatingError('A vendor ID or user ID must be provided to get aggregate ratings.', 400));
    });
  });
});