"use strict";
exports.__esModule = true;
// routes/category.routes.ts
var express_1 = require("express");
var categoryController = require("../controllers/category.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
router.post('/bulk', validation_middleware_1.validate(validation_middleware_1.validateCreateCategoriesBulk), categoryController.createCategoriesBulk);
router.post('/', validation_middleware_1.validate(validation_middleware_1.validateCreateCategory), categoryController.createCategory);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteCategory), categoryController.getCategoryById);
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetAllCategories), categoryController.getAllCategories);
router.put('/:id', validation_middleware_1.validate(validation_middleware_1.validateUpdateCategory), categoryController.updateCategory);
router["delete"]('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteCategory), categoryController.deleteCategory);
exports["default"] = router;
