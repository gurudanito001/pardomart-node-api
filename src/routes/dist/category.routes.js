"use strict";
exports.__esModule = true;
// routes/category.routes.ts
var express_1 = require("express");
var categoryController = require("../controllers/category.controller");
var router = express_1["default"].Router();
router.post('/bulk', categoryController.createCategoriesBulk);
router.post('/', categoryController.createCategory);
router.get('/:id', categoryController.getCategoryById);
router.get('/', categoryController.getAllCategories);
router.put('/:id', categoryController.updateCategory);
router["delete"]('/:id', categoryController.deleteCategory);
exports["default"] = router;
