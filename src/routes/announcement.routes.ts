import { Router } from 'express';
import * as announcementController from '../controllers/announcement.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
// Adjust the path below to match where your multer 'upload' middleware is exported
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// Public/User routes
router.get('/', announcementController.getAnnouncementsController);

// Admin routes
router.post(
  '/',
  //authorize([Role.admin]),
  upload.single('image'),
  announcementController.createAnnouncementController
);

router.patch(
  '/:id',
  authorize([Role.admin]),
  upload.single('image'),
  announcementController.updateAnnouncementController
);

router.delete(
  '/:id',
  authorize([Role.admin]),
  announcementController.deleteAnnouncementController
);

router.post(
  '/:id/broadcast',
  authorize([Role.admin]),
  announcementController.broadcastAnnouncementController
);

export default router;
