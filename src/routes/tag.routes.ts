// routes/tag.routes.ts
import express from 'express';
import * as tagController from '../controllers/tag.controller';

const router = express.Router();

router.post('/', tagController.createTag);
router.post('/bulk', tagController.createTagsBulk);
router.get('/:id', tagController.getTagById);
router.get('/', tagController.getAllTags);
router.patch('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

export default router;