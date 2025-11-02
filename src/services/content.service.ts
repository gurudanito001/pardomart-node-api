import * as contentModel from '../models/content.model';
import { ContentType, UpdateContentPayload } from '../models/content.model';

/**
 * Service to get content by its type.
 * @param type The type of the content to retrieve.
 * @returns The content object.
 */
export const getContentService = (type: ContentType) => {
  return contentModel.getContentByType(type);
};

/**
 * Service to update content by its type.
 * @param type The type of the content to update.
 * @param payload The data to update the content with.
 * @returns The updated content object.
 */
export const updateContentService = (type: ContentType, payload: UpdateContentPayload) => {
  return contentModel.upsertContent(type, payload);
};

