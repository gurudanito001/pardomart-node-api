import { Router } from "express";
import {  addToCartController, getCartByUserIdController, deleteCartController } from "../controllers/cart.controllers";
import { authenticate } from "../middlewares/auth.middleware";

// --- Cart Routes ---
const router = Router();

router.get('/getCartBy/user', authenticate, getCartByUserIdController);  // New route to get cart by user ID
router.post('/add', authenticate, addToCartController);
router.delete('/:id', deleteCartController);

export default router;
