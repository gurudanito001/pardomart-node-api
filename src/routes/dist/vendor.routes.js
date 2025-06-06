"use strict";
exports.__esModule = true;
// routes/vendor.routes.ts
var express_1 = require("express");
var vendorController = require("../controllers/vendor.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
router.post('/', auth_middleware_1.authenticate, validation_middleware_1.validate(validation_middleware_1.validateCreateVendor), vendorController.createVendor);
router.get('/:id', vendorController.getVendorById);
router.get('/', vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/getvendorsby/userId', auth_middleware_1.authenticate, vendorController.getVendorsByUserId);
router.patch('/:id', auth_middleware_1.authenticate, vendorController.updateVendor);
router["delete"]('/:id', auth_middleware_1.authenticate, vendorController.deleteVendor);
exports["default"] = router;
