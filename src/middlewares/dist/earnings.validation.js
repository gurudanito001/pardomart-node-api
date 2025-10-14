"use strict";
exports.__esModule = true;
exports.validateGetTotalEarnings = void 0;
// src/middlewares/earnings.validation.ts
var express_validator_1 = require("express-validator");
var allowedPeriods = ['today', '7days', '1month', '1year'];
exports.validateGetTotalEarnings = [
    express_validator_1.query('period')
        .optional()
        .isIn(allowedPeriods)
        .withMessage("Invalid period. Must be one of: " + allowedPeriods.join(', ')),
];
