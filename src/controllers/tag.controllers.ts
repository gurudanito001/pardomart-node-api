// controllers/tag.controller.ts
import { Request, Response } from 'express';
import * as tagService from '../services/tag.service';
import { TagFilters } from '../models/tag.model';

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagPayload'
 *     responses:
 *       201:
 *         description: The created tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "organic"
 *     CreateTagPayload:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name for the new tag.
 *           example: "gluten-free"
 *     CreateTagsBulkPayload:
 *       type: object
 *       required:
 *         - names
 *       properties:
 *         names:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of names for the tags to be created.
 *           example: ["organic", "local", "fresh"]
 *     UpdateTagPayload:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The new name for the tag.
 *           example: "vegan"
 */
export const createTag = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.createTag(req.body.name);
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /tags/bulk:
 *   post:
 *     summary: Create multiple tags in bulk
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagsBulkPayload'
 *     responses:
 *       201:
 *         description: The created tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Bad request, names array is missing or empty.
 */
export const createTagsBulk = async (req: Request, res: Response) => {
  try {
    const { names } = req.body;

    if (!names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ error: 'Names array is required and must not be empty' });
    }

    const tags = await tagService.createTagsBulk(names);
    res.status(201).json(tags);
  } catch (error) {
    console.error('Error creating tags in bulk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Get a tag by its ID
 *     tags: [Tag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the tag.
 *     responses:
 *       200:
 *         description: The requested tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found.
 */
export const getTagById = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.getTagById(req.params.id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    console.error('Error getting tag by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags, with optional filtering by name
 *     tags: [Tag]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter tags by name (case-insensitive search).
 *     responses:
 *       200:
 *         description: A list of tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 */
export const getAllTags = async (req: Request, res: Response) => {
  const {name}: TagFilters = req?.query;
  try {
    const tags = await tagService.getAllTags({name});
    res.json(tags);
  } catch (error) {
    console.error('Error getting all tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /tags/{id}:
 *   patch:
 *     summary: Update a tag's name
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the tag to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTagPayload'
 *     responses:
 *       200:
 *         description: The updated tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found.
 */
export const updateTag = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body.name);
    res.json(tag);
  } catch (error: any) {
    console.error('Error updating tag:', error);
    if (error?.code === 'P2025') { // Prisma's error code for record not found on update
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the tag to delete.
 *     responses:
 *       200:
 *         description: The deleted tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found.
 */
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.deleteTag(req.params.id);
    res.json(tag);
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    if (error?.code === 'P2025') { // Prisma's error code for record not found on delete
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};