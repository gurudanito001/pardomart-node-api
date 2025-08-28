"use strict";
exports.__esModule = true;
// routes/product.routes.ts
var express_1 = require("express");
var generalSearch_controllers_1 = require("../controllers/generalSearch.controllers");
var router = express_1["default"].Router();
//router.get('/', getVendorsCategoriesAndProductsController);
router.get('/product/', generalSearch_controllers_1.searchByProductController);
router.get('/store', generalSearch_controllers_1.searchByStoreController);
router.get('/category', generalSearch_controllers_1.searchByCategoryController);
exports["default"] = router;
