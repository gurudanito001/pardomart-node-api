import { PrismaClient, ReturnStatus, Role, NotificationType, NotificationCategory, RefundType } from '@prisma/client';
import { OrderCreationError } from './order.service';
import * as walletService from './wallet.service';
import * as notificationService from './notification.service';
import { processRefundService } from './transaction.service';

const prisma = new PrismaClient();

interface ReturnItemInput {
  vendorProductId: string;
  quantity: number;
  reason?: string;
}

interface CreateReturnRequestPayload {
  orderId: string;
  items: ReturnItemInput[];
  reason?: string;
}

/**
 * Creates a new return request for a delivered order.
 */
export const createReturnRequestService = async (userId: string, payload: CreateReturnRequestPayload) => {
  const { orderId, items, reason } = payload;

  // 1. Fetch order with necessary relations
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: { vendorProduct: true }
      },
      vendor: {
        select: { userId: true, id: true } // Need vendor owner ID for notification
      }
    }
  });

  // 2. Validations
  if (!order) {
    throw new OrderCreationError('Order not found.', 404);
  }
  if (order.userId !== userId) {
    throw new OrderCreationError('You are not authorized to request a return for this order.', 403);
  }
  if (order.orderStatus !== 'delivered' && order.orderStatus !== 'picked_up_by_customer') {
    throw new OrderCreationError('Order must be delivered before a return can be requested.', 400);
  }

  // 3. Calculate Refund Amount & Validate Items
  let refundAmount = 0;
  const returnItemsData = [];

  for (const item of items) {
    const orderItem = order.orderItems.find(oi => oi.vendorProductId === item.vendorProductId);
    
    if (!orderItem) {
      throw new OrderCreationError(`Product with ID ${item.vendorProductId} was not found in this order.`, 400);
    }
    if (item.quantity > orderItem.quantity) {
      throw new OrderCreationError(`Return quantity for ${orderItem.vendorProduct.name} exceeds ordered quantity.`, 400);
    }

    // Use snapshotted purchasedPrice and isEbtEligible from the OrderItem
    const itemPrice = orderItem.purchasedPrice ?? (orderItem.vendorProduct.discountedPrice ?? orderItem.vendorProduct.price);
    refundAmount += itemPrice * item.quantity;
    returnItemsData.push({
      vendorProductId: item.vendorProductId,
      name: orderItem.vendorProduct.name,
      quantity: item.quantity,
      price: itemPrice,
      isEbtEligible: orderItem.isEbtEligible, // Snapshot eligibility in return metadata
      reason: item.reason
    });
  }

  // 4. Create Return Request
  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderId,
      userId,
      vendorId: order.vendorId,
      items: returnItemsData,
      reason,
      refundAmount,
      status: ReturnStatus.PENDING
    }
  });

  // 5. Notify Vendor
  if (order.vendor.userId) {
    await notificationService.createNotification({
      userId: order.vendor.userId,
      type: NotificationType.NEW_ORDER_PLACED, // You might want to add a NEW_RETURN_REQUEST type
      category: NotificationCategory.ORDER,
      title: 'New Return Request',
      body: `A customer has requested a return for Order #${order.orderCode}.`,
      meta: { returnRequestId: returnRequest.id, orderId: order.id }
    });
  }

  return returnRequest;
};

/**
 * Updates the status of a return request. Handles refunds when status is set to REFUNDED.
 */
export const updateReturnRequestStatusService = async (requestId: string, status: ReturnStatus, userId: string, userRole: Role) => {
  return await prisma.$transaction(async (tx) => {
    const returnRequest = await tx.returnRequest.findUnique({ 
      where: { id: requestId },
      include: { order: true } 
    });
    if (!returnRequest) throw new OrderCreationError('Return request not found.', 404);

    // If approving refund, process universal refund (Stripe or Wallet)
    if (status === ReturnStatus.REFUNDED && returnRequest.status !== ReturnStatus.REFUNDED) {
      const items = returnRequest.items as any[];
      let ebtTotal = 0;
      let cardTotal = 0;

      // Calculate the split based on the metadata stored during creation
      items.forEach(item => {
        if (item.isEbtEligible) {
          ebtTotal += item.price * item.quantity;
        } else {
          cardTotal += item.price * item.quantity;
        }
      });

      if (ebtTotal > 0) {
        await processRefundService(tx, returnRequest.order, ebtTotal, `EBT Refund for Return #${returnRequest.id.substring(0, 8)}`, RefundType.PARTIAL_REFUND, 'ebt');
      }
      if (cardTotal > 0) {
        await processRefundService(tx, returnRequest.order, cardTotal, `Card Refund for Return #${returnRequest.id.substring(0, 8)}`, RefundType.PARTIAL_REFUND, 'card');
      }
    }

    return await tx.returnRequest.update({
      where: { id: requestId },
      data: { status }
    });
  });
};