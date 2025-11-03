"use strict";
exports.__esModule = true;
// routes/tag.routes.ts
var express_1 = require("express");
var tagController = require("../controllers/tag.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
var router = express_1["default"].Router();
// --- Public Tag Routes ---
router.get('/:id', tagController.getTagById);
router.get('/', tagController.getAllTags);
// --- Admin-only Tag Routes ---
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), tagController.createTag);
router.post('/bulk', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), tagController.createTagsBulk);
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), tagController.updateTag);
router["delete"]('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), tagController.deleteTag);
exports["default"] = router;
