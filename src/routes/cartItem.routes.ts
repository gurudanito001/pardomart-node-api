import { Router } from "express";
import { addItemToCartController, getCartItemByIdController, updateCartItemController, deleteCartItemController } from "../controllers/cartItem.controllers";
import { authenticate } from "../middlewares/auth.middleware";

// --- CartItem Routes ---
const router = Router();

router.use(authenticate); // Protect all cart item routes

router.post('/', addItemToCartController);
router.get('/:id', getCartItemByIdController);
router.put('/:id', updateCartItemController);
router.delete('/:id', deleteCartItemController);

export default router;
