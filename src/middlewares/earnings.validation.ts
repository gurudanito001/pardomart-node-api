// src/middlewares/earnings.validation.ts
import { query } from 'express-validator';

const allowedPeriods = ['today', '7days', '1month', '1year'];

export const validateGetTotalEarnings = [
  query('period')
    .optional()
    .isIn(allowedPeriods)
    .withMessage(`Invalid period. Must be one of: ${allowedPeriods.join(', ')}`),
];
