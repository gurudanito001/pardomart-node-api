"use strict";
exports.__esModule = true;
// routes/staff.routes.ts
var express_1 = require("express");
var staffController = require("../controllers/staff.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
// import { validate, validateCreateStaff, validateId } from '../middlewares/validation.middleware';
var router = express_1.Router();
router.use(auth_middleware_1.authenticate);
// Create a new staff member
router.post('/', /* validate(validateCreateStaff), */ staffController.createStaffController);
// List all staff for the authenticated user (across all their stores)
router.get('/', auth_middleware_1.authorize([client_1.Role.vendor, client_1.Role.store_admin]), staffController.listStaffForVendorOrAdminController);
// List all transactions for staff of the authenticated vendor
router.get('/transactions', auth_middleware_1.authorize(['vendor']), staffController.listStaffTransactionsController);
router.get('/store/:vendorId', /* validate(validateId('vendorId')), */ staffController.listStaffByVendorController);
router.get('/:staffId', /* validate(validateId('staffId')), */ staffController.getStaffByIdController);
router.patch('/:staffId', /* validate(validateId('staffId')), */ staffController.updateStaffController);
router["delete"]('/:staffId', /* validate(validateId('staffId')), */ staffController.deleteStaffController);
exports["default"] = router;
