import { Request, Response } from 'express';
import * as faqService from '../services/faq.service';
import { CreateFaqPayload, UpdateFaqPayload } from '../models/faq.model';
import { StatusCodes } from 'http-status-codes';

/**
 * @swagger
 * tags:
 *   name: FAQ
 *   description: Frequently Asked Questions management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Faq:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *         isActive:
 *           type: boolean
 *         sortOrder:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateFaqPayload:
 *       type: object
 *       required: [question, answer]
 *       properties:
 *         question: { type: string, example: "How do I track my order?" }
 *         answer: { type: string, example: "You can track your order from the 'My Orders' section." }
 *         isActive: { type: boolean, default: true }
 *         sortOrder: { type: integer, default: 0 }
 *     UpdateFaqPayload:
 *       type: object
 *       properties:
 *         question: { type: string }
 *         answer: { type: string }
 *         isActive: { type: boolean }
 *         sortOrder: { type: integer }
 */

/**
 * @desc Get all active FAQs
 * @route GET /api/v1/faqs
 * @access Public
 * @swagger
 * /api/v1/faqs:
 *   get:
 *     summary: Get all active FAQs
 *     tags: [FAQ]
 *     parameters:
 *       - in: query
 *         name: question
 *         schema:
 *           type: string
 *         description: "Filter FAQs by a search term in the question (case-insensitive)."
 *       - in: query
 *         name: answer
 *         schema:
 *           type: string
 *         description: "Filter FAQs by a search term in the answer (case-insensitive)."
 *     responses:
 *       200:
 *         description: A list of active FAQs, ordered by sortOrder.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Faq' }
 *       500:
 *         description: Internal server error.
 */
export const getAllFaqsController = async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.query;
    const filters = {
      question: question as string | undefined,
      answer: answer as string | undefined,
    };
    const faqs = await faqService.getAllFaqsService(filters);
    res.status(StatusCodes.OK).json(faqs);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error fetching FAQs' });
  }
};

/**
 * @desc Create a new FAQ
 * @route POST /api/v1/faqs
 * @access Admin
 * @swagger
 * /api/v1/faqs:
 *   post:
 *     summary: Create a new FAQ (Admin)
 *     tags: [FAQ, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFaqPayload'
 *     responses:
 *       201:
 *         description: The created FAQ.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Bad request (validation error).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
export const createFaqController = async (req: Request, res: Response) => {
  try {
    const payload: CreateFaqPayload = req.body;
    const newFaq = await faqService.createFaqService(payload);
    res.status(StatusCodes.CREATED).json(newFaq);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error creating FAQ' });
  }
};

/**
 * @desc Update an FAQ
 * @route PATCH /api/v1/faqs/:id
 * @access Admin
 * @swagger
 * /api/v1/faqs/{id}:
 *   patch:
 *     summary: Update an FAQ (Admin)
 *     tags: [FAQ, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: The ID of the FAQ to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFaqPayload'
 *     responses:
 *       200:
 *         description: The updated FAQ.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Bad request (validation error).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: FAQ not found.
 *       500:
 *         description: Internal server error.
 */
export const updateFaqController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload: UpdateFaqPayload = req.body;
  try {
    const updatedFaq = await faqService.updateFaqService(id, payload);
    res.status(StatusCodes.OK).json(updatedFaq);
  } catch (error: any) {
    if (error.message === 'FAQ not found') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error updating FAQ' });
  }
};

/**
 * @desc Delete an FAQ
 * @route DELETE /api/v1/faqs/:id
 * @access Admin
 * @swagger
 * /api/v1/faqs/{id}:
 *   delete:
 *     summary: Delete an FAQ (Admin)
 *     tags: [FAQ, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: The ID of the FAQ to delete.
 *     responses:
 *       204:
 *         description: FAQ deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: FAQ not found.
 *       500:
 *         description: Internal server error.
 */
export const deleteFaqController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await faqService.deleteFaqService(id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error: any) {
    if (error.message === 'FAQ not found') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error deleting FAQ' });
  }
};