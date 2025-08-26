// routes/tag.routes.ts
import express from 'express';
import * as feeController from '../controllers/fee.controllers';

const router = express.Router();

router.post('/', feeController.createFeeController);
router.get('/current', feeController.getCurrentFeesController);
router.get('/current/:type', feeController.getCurrentFeesController);
router.patch('/:id', feeController.updateFeeController);
router.patch('/deactivate/:type', feeController.deactivateFeeController);
router.delete('/:id', feeController.deleteFeeController);
router.post('/calculate-fees', feeController.calculateFeesController);

export default router;