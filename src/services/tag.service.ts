// services/tag.service.ts
import * as tagModel from '../models/tag.model';
import { Tag } from '@prisma/client';

export const createTag = async (name: string): Promise<Tag> => {
  return tagModel.createTag(name);
};

export const createTagsBulk = async (names: string[]): Promise<Tag[]> => {
  return tagModel.createTagsBulk(names);
};

export const getTagById = async (id: string): Promise<Tag | null> => {
  return tagModel.getTagById(id);
};

export const getAllTags = async (filters: tagModel.TagFilters): Promise<Tag[]> => {
  return tagModel.getAllTags(filters);
};

export const updateTag = async (id: string, name: string): Promise<Tag> => {
  return tagModel.updateTag(id, name);
};

export const deleteTag = async (id: string): Promise<Tag> => {
  return tagModel.deleteTag(id);
};