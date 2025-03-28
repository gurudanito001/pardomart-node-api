"use strict";
exports.__esModule = true;
var express_1 = require("express");
var auth_routes_1 = require("./auth.routes");
var users_routes_1 = require("./users.routes");
var vendor_routes_1 = require("./vendor.routes");
var vendorOpeningHours_routes_1 = require("./vendorOpeningHours.routes");
// Create a new Router instance
var router = express_1.Router();
// Mount the routers
router.use('/api/v1/auth', auth_routes_1["default"]);
router.use('/api/v1/users', users_routes_1["default"]);
router.use('/api/v1/vendors', vendor_routes_1["default"]);
router.use('/api/v1/openingHours', vendorOpeningHours_routes_1["default"]);
exports["default"] = router;
