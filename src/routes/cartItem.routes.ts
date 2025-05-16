import { Router } from "express";
import { getCartItemByIdController, updateCartItemController, deleteCartItemController } from "../controllers/cartItem.controllers";
import { authenticate } from "../middlewares/auth.middleware";

// --- CartItem Routes ---
const router = Router();

router.get('/:id', getCartItemByIdController);
router.put('/:id', updateCartItemController);
router.delete('/:id', deleteCartItemController);

export default router;
