"use strict";
exports.__esModule = true;
// src/routes/customer.routes.ts
var express_1 = require("express");
var customerController = require("../controllers/customer.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
var router = express_1.Router();
router.use(auth_middleware_1.authenticate);
// --- Admin-only Customer Routes ---
router.get('/admin/overview', auth_middleware_1.authorize([client_1.Role.admin]), customerController.getAdminCustomerOverviewController);
router.get('/admin/all', auth_middleware_1.authorize([client_1.Role.admin]), customerController.adminListAllCustomersController);
router.patch('/admin/:customerId', auth_middleware_1.authorize([client_1.Role.admin]), customerController.adminUpdateCustomerProfileController);
router.get('/admin/:customerId/transactions', auth_middleware_1.authorize([client_1.Role.admin]), customerController.adminListCustomerTransactionsController);
router.get('/admin/:customerId', auth_middleware_1.authorize([client_1.Role.admin]), customerController.adminGetCustomerDetailsController);
router.get('/', auth_middleware_1.authorize([client_1.Role.vendor, client_1.Role.store_admin, client_1.Role.store_shopper]), customerController.listCustomersController);
router.get('/:customerId/transactions', auth_middleware_1.authorize([client_1.Role.vendor, client_1.Role.store_admin]), customerController.listCustomerTransactionsController);
exports["default"] = router;
