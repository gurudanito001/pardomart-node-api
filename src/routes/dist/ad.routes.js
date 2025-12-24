"use strict";
exports.__esModule = true;
// src/routes/ad.routes.ts
var express_1 = require("express");
var multer_1 = require("multer");
var adController = require("../controllers/ad.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
var router = express_1.Router();
var upload = multer_1["default"]({ storage: multer_1["default"].memoryStorage() });
/**
 * @swagger
 * components:
 *   schemas:
 *     Ad:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         title: { type: string }
 *         description: { type: string, nullable: true }
 *         imageUrl: { type: string, format: uri }
 *         vendorId: { type: string, format: uuid }
 *         isActive: { type: boolean }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time, nullable: true }
 *     CreateAdPayload:
 *       type: object
 *       required: [title, vendorId, image]
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         vendorId: { type: string, format: uuid }
 *         image: { type: string, format: binary, description: "The ad image file." }
 *         isActive: { type: boolean }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 *     UpdateAdPayload:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         image: { type: string, format: binary }
 *         isActive: { type: boolean }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 */
// --- Public Ad Routes ---
router.get('/', adController.listAdsController);
router.get('/:id', adController.getAdByIdController);
// --- Admin-only Ad Routes ---
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), upload.single('image'), adController.createAdController);
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), upload.single('image'), adController.updateAdController);
router["delete"]('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), adController.deleteAdController);
exports["default"] = router;
