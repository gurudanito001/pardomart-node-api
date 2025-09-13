"use strict";
exports.__esModule = true;
// routes/tag.routes.ts
var express_1 = require("express");
var feeController = require("../controllers/fee.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
var router = express_1["default"].Router();
// Public routes
router.get('/current', feeController.getCurrentFeesController);
router.get('/current/:type', validation_middleware_1.validate(validation_middleware_1.validateFeeType), feeController.getCurrentFeesController);
// Authenticated routes
router.post('/calculate-fees', auth_middleware_1.authenticate, validation_middleware_1.validate(validation_middleware_1.validateCalculateFees), feeController.calculateFeesController);
// Admin routes
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateCreateFee), feeController.createFeeController);
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateUpdateFee), feeController.updateFeeController);
router.patch('/deactivate/:type', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateFeeType), feeController.deactivateFeeController);
router["delete"]('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateFeeId), feeController.deleteFeeController);
exports["default"] = router;
