"use strict";
exports.__esModule = true;
exports.smsLimiter = void 0;
var express_rate_limit_1 = require("express-rate-limit");
// Limit requests to SMS-sending endpoints
exports.smsLimiter = express_rate_limit_1["default"]({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes'
    }
});
