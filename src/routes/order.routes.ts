import { Router } from "express";
import { createOrderController, getOrderByIdController, getOrdersByUserController, updateOrderController, updateOrderStatusController,
  getVendorOrdersController,
  acceptOrderController,
  declineOrderController,
  startShoppingController,
 } from "../controllers/order.controllers";
import { authenticate, authorizeVendorAccess } from "../middlewares/auth.middleware";

// --- Cart Routes ---
const router = Router();

router.post('/', authenticate, createOrderController); // Changed route to /
router.get('/:id', authenticate, getOrderByIdController);
router.get('/user/getByUserId', authenticate, getOrdersByUserController);  // New route to get cart by user ID
router.patch('/:id', authenticate, updateOrderController);
router.patch('/:id/status', authenticate, updateOrderStatusController);


// Query parameters: status=pending,accepted
router.get('/vendorOrders', authenticate, authorizeVendorAccess, getVendorOrdersController);

router.patch('/:orderId/accept', authenticate, authorizeVendorAccess, acceptOrderController);

// Body: { "reason": "Optional reason for declining" }
router.patch('/:orderId/decline', authenticate, authorizeVendorAccess, declineOrderController);

router.patch('/:orderId/start-shopping', authenticate, authorizeVendorAccess, startShoppingController);

export default router;


