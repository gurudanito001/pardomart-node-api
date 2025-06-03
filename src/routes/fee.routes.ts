// routes/tag.routes.ts
import express from 'express';
import * as feeController from '../controllers/fee.controllers';

const router = express.Router();

router.post('/', feeController.createFeeController);
router.get('/current', feeController.getCurrentFeesController);
router.get('/current/:type', feeController.getCurrentFeesController);
router.patch('/:id', feeController.updateFeeController);
router.patch('/deactivate/:type', feeController.deactivateFeeController);
router.delete('/:id', feeController.deactivateFeeController);

export default router;