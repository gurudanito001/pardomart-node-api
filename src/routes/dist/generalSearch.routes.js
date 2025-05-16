"use strict";
exports.__esModule = true;
// routes/product.routes.ts
var express_1 = require("express");
var generalSearch_controllers_1 = require("../controllers/generalSearch.controllers");
var router = express_1["default"].Router();
router.get('/', generalSearch_controllers_1.getVendorsCategoriesAndProductsController);
router.get('/vendor/:vendorId', generalSearch_controllers_1.getVendorCategoriesWithProductsController);
router.get('/category/:categoryId', generalSearch_controllers_1.getCategoryDetailsWithRelatedDataController);
router.get('/product/', generalSearch_controllers_1.getStoresByProductIdController);
exports["default"] = router;
