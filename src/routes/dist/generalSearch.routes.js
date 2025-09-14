"use strict";
exports.__esModule = true;
// routes/product.routes.ts
var express_1 = require("express");
var generalSearch_controllers_1 = require("../controllers/generalSearch.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
//router.get('/', getVendorsCategoriesAndProductsController);
router.get('/product/', validation_middleware_1.validate(validation_middleware_1.validateGeneralSearch), generalSearch_controllers_1.searchByProductController);
router.get('/store', validation_middleware_1.validate(validation_middleware_1.validateGeneralSearch), generalSearch_controllers_1.searchByStoreController);
router.get('/category', validation_middleware_1.validate(validation_middleware_1.validateGeneralSearch), generalSearch_controllers_1.searchByCategoryController);
router.get('/category/:categoryId', validation_middleware_1.validate(validation_middleware_1.validateSearchByCategoryId), generalSearch_controllers_1.searchByCategoryIdController);
router.get('/storeProducts/:storeId', validation_middleware_1.validate(validation_middleware_1.validateSearchStoreProducts), generalSearch_controllers_1.searchStoreProductsController);
exports["default"] = router;
