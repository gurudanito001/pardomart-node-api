import { Router } from "express";
import { getCartItemByIdController, updateCartItemController, deleteCartItemController } from "../controllers/cartItem.controllers";
import { authenticate } from "../middlewares/auth.middleware";

// --- CartItem Routes ---
const router = Router();

router.use(authenticate); // Protect all cart item routes

router.get('/:id', getCartItemByIdController);
router.put('/:id', updateCartItemController);
router.delete('/:id', deleteCartItemController);

export default router;
