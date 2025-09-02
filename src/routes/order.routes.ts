import { Router } from "express";
import { createOrderController, getOrderByIdController, getOrdersByUserController, updateOrderController, updateOrderStatusController,
  getVendorOrdersController,
  acceptOrderController,
  declineOrderController,
  startShoppingController,
  getAvailableDeliverySlotsController,
 } from "../controllers/order.controllers";
import { authenticate, authorizeVendorAccess } from "../middlewares/auth.middleware";

// --- Cart Routes ---
const router = Router();

// Specific GET routes must be defined before any dynamic GET routes (like /:id)
router.get('/vendorOrders', authenticate, authorizeVendorAccess, getVendorOrdersController);
router.get('/delivery-slots', authenticate, getAvailableDeliverySlotsController);
router.get('/user/getByUserId', authenticate, getOrdersByUserController);

router.post('/', authenticate, createOrderController); // Changed route to /
router.get('/:id', authenticate, getOrderByIdController);
router.patch('/:id', authenticate, updateOrderController);
router.patch('/:id/status', authenticate, updateOrderStatusController);

router.patch('/:orderId/accept', authenticate, authorizeVendorAccess, acceptOrderController);

// Body: { "reason": "Optional reason for declining" }
router.patch('/:orderId/decline', authenticate, authorizeVendorAccess, declineOrderController);

router.patch('/:orderId/start-shopping', authenticate, authorizeVendorAccess, startShoppingController);

export default router;
