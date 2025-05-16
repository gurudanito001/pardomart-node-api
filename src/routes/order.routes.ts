import { Router } from "express";
import { createOrderController, getOrderByIdController, getOrdersByUserController, updateOrderController, updateOrderStatusController, cancelOrderController, } from "../controllers/order.controllers";
import { authenticate } from "../middlewares/auth.middleware";

// --- Cart Routes ---
const router = Router();

router.post('/', authenticate, createOrderController); // Changed route to /
router.get('/:id', authenticate, getOrderByIdController);
router.get('/user/getByUserId', authenticate, getOrdersByUserController);  // New route to get cart by user ID
router.patch('/:id', authenticate, updateOrderController);
router.patch('/:id/status', authenticate, updateOrderStatusController);
router.patch('/:id/cancel', authenticate, cancelOrderController);

export default router;


