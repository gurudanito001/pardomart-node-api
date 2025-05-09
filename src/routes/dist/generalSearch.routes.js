"use strict";
exports.__esModule = true;
// routes/product.routes.ts
var express_1 = require("express");
var generalSearch_controller_1 = require("../controllers/generalSearch.controller");
var router = express_1["default"].Router();
router.get('/', generalSearch_controller_1.getVendorsCategoriesAndProductsController);
router.get('/vendor/:vendorId', generalSearch_controller_1.getVendorCategoriesWithProductsController);
router.get('/category/:categoryId', generalSearch_controller_1.getCategoryDetailsWithRelatedDataController);
router.get('/product/', generalSearch_controller_1.getStoresByProductIdController);
exports["default"] = router;
