import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, validateUpdateContent, validateContentType } from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentType:
 *       type: string
 *       enum: [PRIVACY_POLICY, TERMS_OF_SERVICE]
 *     UpdateContentPayload:
 *       type: object
 *       required: [content]
 *       properties:
 *         content: { type: string, description: "The HTML content string." }
 */

router.get('/:type', validate(validateContentType), contentController.getContentController);
router.patch('/:type', authenticate, authorize([Role.admin]), validate(validateUpdateContent), contentController.updateContentController);

export default router;

