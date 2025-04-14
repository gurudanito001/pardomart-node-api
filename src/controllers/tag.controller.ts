// controllers/tag.controller.ts
import { Request, Response } from 'express';
import * as tagService from '../services/tag.service';

export const createTag = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.createTag(req.body.name);
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await tagService.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Error getting all tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body.name);
    res.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.deleteTag(req.params.id);
    res.json(tag);
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};