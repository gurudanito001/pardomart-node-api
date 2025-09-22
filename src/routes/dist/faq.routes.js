"use strict";
exports.__esModule = true;
var express_1 = require("express");
var faqController = require("../controllers/faq.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var client_1 = require("@prisma/client");
var router = express_1.Router();
// Public route to get all active FAQs
router.get('/', faqController.getAllFaqsController);
// --- Admin-only routes ---
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateCreateFaq), faqController.createFaqController);
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateUpdateFaq), faqController.updateFaqController);
router["delete"]('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateFaqId), faqController.deleteFaqController);
exports["default"] = router;
