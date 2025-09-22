import * as faqModel from '../models/faq.model';
import { CreateFaqPayload, UpdateFaqPayload } from '../models/faq.model';

/**
 * Service to get all active FAQs.
 */
export const getAllFaqsService = () => {
  return faqModel.getAll();
};

/**
 * Service to create a new FAQ.
 * @param payload The data for the new FAQ.
 */
export const createFaqService = (payload: CreateFaqPayload) => {
  return faqModel.create(payload);
};

/**
 * Service to update an existing FAQ.
 * @param id The ID of the FAQ to update.
 * @param payload The data to update the FAQ with.
 */
export const updateFaqService = async (id: string, payload: UpdateFaqPayload) => {
  const faq = await faqModel.getById(id);
  if (!faq) {
    throw new Error('FAQ not found');
  }
  return faqModel.update(id, payload);
};

/**
 * Service to delete an FAQ.
 * @param id The ID of the FAQ to delete.
 */
export const deleteFaqService = async (id: string) => {
  const faq = await faqModel.getById(id);
  if (!faq) {
    throw new Error('FAQ not found');
  }
  return faqModel.remove(id);
};