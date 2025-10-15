import { mockDeep } from 'jest-mock-extended';
import * as wishlistService from '../services/wishlist.service';
import * as wishlistModel from '../models/wishlist.model';
import * as productModel from '../models/product.model';
import { WishlistError } from '../services/wishlist.service';
import { VendorProduct, WishlistItem, Product, Vendor } from '@prisma/client';

// Mock the model files to isolate the service for testing
jest.mock('../models/wishlist.model');
jest.mock('../models/product.model');

describe('Wishlist Service', () => {
  // Create typed mocks of the imported models
  const mockWishlistModel = wishlistModel as jest.Mocked<typeof wishlistModel>;
  const mockProductModel = productModel as jest.Mocked<typeof productModel>;

  const userId = 'user-123';
  const vendorProductId = 'vp-abc';
  const wishlistItemId = 'wishlist-item-xyz';

  // Reset mocks before each test to ensure a clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToWishlistService', () => {
    it('should add a product to the wishlist successfully', async () => {
      // The service expects a product with relations, so we mock the nested structure.
      const mockProduct = { 
        id: vendorProductId,
        product: { id: 'prod-123' } as Product,
        vendor: { id: 'vendor-123', userId: 'vendor-user-123' } as Vendor,
      } as any; // Using 'any' to simplify mock creation for the test's purpose.
      const mockWishlistItem = { id: wishlistItemId, userId, vendorProductId } as WishlistItem;

      mockProductModel.getVendorProductById.mockResolvedValue(mockProduct);
      mockWishlistModel.findWishlistItem.mockResolvedValue(null);
      mockWishlistModel.addToWishlist.mockResolvedValue(mockWishlistItem);

      const result = await wishlistService.addToWishlistService(userId, vendorProductId);

      expect(mockProductModel.getVendorProductById).toHaveBeenCalledWith(vendorProductId);
      expect(mockWishlistModel.findWishlistItem).toHaveBeenCalledWith(userId, vendorProductId);
      expect(mockWishlistModel.addToWishlist).toHaveBeenCalledWith(userId, vendorProductId);
      expect(result).toEqual(mockWishlistItem);
    });

    it('should throw a 404 error if the product does not exist', async () => {
      mockProductModel.getVendorProductById.mockResolvedValue(null);

      await expect(wishlistService.addToWishlistService(userId, vendorProductId))
        .rejects.toThrow(new WishlistError('Product not found.', 404));
    });

    it('should throw a 409 error if the product is already in the wishlist', async () => {
      const mockProduct = { 
        id: vendorProductId,
        product: { id: 'prod-123' } as Product,
        vendor: { id: 'vendor-123', userId: 'vendor-user-123' } as Vendor,
      } as any;
      const existingWishlistItem = { id: wishlistItemId, userId, vendorProductId } as WishlistItem;

      mockProductModel.getVendorProductById.mockResolvedValue(mockProduct);
      mockWishlistModel.findWishlistItem.mockResolvedValue(existingWishlistItem);

      await expect(wishlistService.addToWishlistService(userId, vendorProductId))
        .rejects.toThrow(new WishlistError('Product is already in your wishlist.', 409));
    });
  });

  describe('getWishlistService', () => {
    it('should return the user\'s wishlist', async () => {
      const mockWishlist = [{ id: wishlistItemId, userId, vendorProductId }] as any[];
      mockWishlistModel.getWishlistByUserId.mockResolvedValue(mockWishlist);

      const result = await wishlistService.getWishlistService(userId);

      expect(mockWishlistModel.getWishlistByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockWishlist);
    });
  });

  describe('removeFromWishlistService', () => {
    const mockWishlistItem = { id: wishlistItemId, userId, vendorProductId } as WishlistItem;

    it('should remove an item from the wishlist successfully', async () => {
      mockWishlistModel.getWishlistItemById.mockResolvedValue(mockWishlistItem);
      mockWishlistModel.removeFromWishlist.mockResolvedValue(mockWishlistItem);

      const result = await wishlistService.removeFromWishlistService(userId, wishlistItemId);

      expect(mockWishlistModel.getWishlistItemById).toHaveBeenCalledWith(wishlistItemId);
      expect(mockWishlistModel.removeFromWishlist).toHaveBeenCalledWith(wishlistItemId);
      expect(result).toEqual(mockWishlistItem);
    });

    it('should throw a 404 error if the wishlist item is not found', async () => {
      mockWishlistModel.getWishlistItemById.mockResolvedValue(null);

      await expect(wishlistService.removeFromWishlistService(userId, wishlistItemId))
        .rejects.toThrow(new WishlistError('Wishlist item not found.', 404));
    });

    it('should throw a 403 error if the user is not authorized to remove the item', async () => {
      const anotherUsersItem = { ...mockWishlistItem, userId: 'another-user-id' };
      mockWishlistModel.getWishlistItemById.mockResolvedValue(anotherUsersItem);

      await expect(wishlistService.removeFromWishlistService(userId, wishlistItemId))
        .rejects.toThrow(new WishlistError('You are not authorized to remove this item.', 403));
    });
  });
});