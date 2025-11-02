"use strict";
exports.__esModule = true;
var express_1 = require("express");
var contentController = require("../controllers/content.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var client_1 = require("@prisma/client");
var router = express_1.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     ContentType:
 *       type: string
 *       enum: [PRIVACY_POLICY, TERMS_OF_SERVICE]
 *     UpdateContentPayload:
 *       type: object
 *       required: [content]
 *       properties:
 *         content: { type: string, description: "The HTML content string." }
 */
router.get('/:type', validation_middleware_1.validate(validation_middleware_1.validateContentType), contentController.getContentController);
router.patch('/:type', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateUpdateContent), contentController.updateContentController);
exports["default"] = router;
