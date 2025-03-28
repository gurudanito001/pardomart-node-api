"use strict";
exports.__esModule = true;
exports.generateToken = void 0;
// utils/auth.ts
var jsonwebtoken_1 = require("jsonwebtoken");
var JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
exports.generateToken = function (userId, role) {
    return jsonwebtoken_1["default"].sign({ userId: userId, role: role }, JWT_SECRET, { expiresIn: '30d' });
};
