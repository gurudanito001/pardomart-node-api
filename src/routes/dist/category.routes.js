"use strict";
exports.__esModule = true;
// routes/category.routes.ts
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var categoryController = require("../controllers/category.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var client_1 = require("@prisma/client");
var router = express_1["default"].Router();
// --- Admin Category Overview ---
router.get('/admin/overview', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), categoryController.getCategoryOverviewController);
// --- Public Category Routes ---
router.get('/parents', categoryController.getAllParentCategoriesController);
router.get('/sub-categories', categoryController.getAllSubCategoriesController);
// --- Admin-only Category Creation/Modification ---
router.post('/bulk', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateCreateCategoriesBulk), categoryController.createCategoriesBulk);
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateCreateCategory), categoryController.createCategory);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteCategory), categoryController.getCategoryById);
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetAllCategories), categoryController.getAllCategories);
router.put('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateUpdateCategory), categoryController.updateCategory);
router["delete"]('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteCategory), categoryController.deleteCategory);
exports["default"] = router;
