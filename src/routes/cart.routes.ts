import { Router } from 'express';
import {
  getCartsController,
  getCartByIdController,
  deleteCartController,
} from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All cart routes should be authenticated
router.use(authenticate);

router.get('/', getCartsController);

router.get('/:cartId', getCartByIdController);

router.delete('/:cartId', deleteCartController);

export default router;