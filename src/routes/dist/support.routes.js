"use strict";
exports.__esModule = true;
var express_1 = require("express");
var supportController = require("../controllers/support.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var client_1 = require("@prisma/client");
var router = express_1.Router();
router.use(auth_middleware_1.authenticate);
// User-facing routes
router.post('/tickets', validation_middleware_1.validate(validation_middleware_1.validateCreateSupportTicket), supportController.createSupportTicketController);
router.get('/tickets/me', supportController.getMySupportTicketsController);
// Admin-facing routes
router.get('/tickets', auth_middleware_1.authorize([client_1.Role.admin]), supportController.getAllSupportTicketsController);
router.patch('/tickets/:ticketId/status', auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateUpdateSupportTicketStatus), supportController.updateSupportTicketStatusController);
exports["default"] = router;
