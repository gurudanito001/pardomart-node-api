"use strict";
exports.__esModule = true;
// routes/vendor.routes.ts
var express_1 = require("express");
var vendorController = require("../controllers/vendor.controller");
var multer_1 = require("multer");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
// Use multer().none() to handle multipart/form-data text fields.
// This will populate req.body with the text fields from the formData.
router.post('/', auth_middleware_1.authenticate, multer_1["default"]().none(), validation_middleware_1.validate(validation_middleware_1.validateCreateVendor), vendorController.createVendor);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetVendorById), vendorController.getVendorById);
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetAllVendors), vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/getvendorsby/userId', auth_middleware_1.authenticate, vendorController.getVendorsByUserId);
router.patch('/:id', auth_middleware_1.authenticate, multer_1["default"]().none(), validation_middleware_1.validate(validation_middleware_1.validateUpdateVendor), vendorController.updateVendor);
router["delete"]('/:id', auth_middleware_1.authenticate, validation_middleware_1.validate(validation_middleware_1.validateVendorId), vendorController.deleteVendor);
exports["default"] = router;
