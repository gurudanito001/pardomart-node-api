import { Router } from 'express';
import multer from 'multer';
import * as mediaController from '../controllers/media.controller';

const router = Router();

// Use memory storage to handle the file as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), mediaController.uploadFile);

export default router;