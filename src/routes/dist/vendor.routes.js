"use strict";
exports.__esModule = true;
// routes/vendor.routes.ts
var express_1 = require("express");
var vendorController = require("../controllers/vendor.controller");
var multer_1 = require("multer");
var auth_middleware_1 = require("../middlewares/auth.middleware"); // Assuming authorize is here
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
// Use multer().none() to handle multipart/form-data text fields.
// This will populate req.body with the text fields from the formData.
router.post('/', auth_middleware_1.authenticate, validation_middleware_1.validate(validation_middleware_1.validateCreateVendor), vendorController.createVendor);
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetAllVendors), vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/incomplete-setups', auth_middleware_1.authenticate, vendorController.getIncompleteSetups);
router.get('/getvendorsby/userId', auth_middleware_1.authenticate, vendorController.getVendorsByUserId);
// Admin-specific route to get platform overview data
router.get('/overview', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), vendorController.getOverviewDataController);
// Admin-specific route to get a vendor user's details
router.get('/users/:userId', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), vendorController.getVendorUserByIdController);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetVendorById), vendorController.getVendorById);
router.patch('/:id/approve', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), validation_middleware_1.validate(validation_middleware_1.validateVendorId), vendorController.approveVendor); // Admin only
router.patch('/:id/publish', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor', 'store_admin']), validation_middleware_1.validate(validation_middleware_1.validateVendorId), vendorController.publishVendor); // Vendor owner or store admin
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor', 'store_admin']), multer_1["default"]().none(), validation_middleware_1.validate(validation_middleware_1.validateUpdateVendor), vendorController.updateVendor); // Vendor owner or store admin
router["delete"]('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor']), validation_middleware_1.validate(validation_middleware_1.validateVendorId), vendorController.deleteVendor); // Vendor owner only
exports["default"] = router;
