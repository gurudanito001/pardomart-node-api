"use strict";
exports.__esModule = true;
// routes/vendorOpeningHours.routes.ts
var express_1 = require("express");
var vendorOpeningHoursController = require("../controllers/vendorOpeningHours.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
router.patch('/', auth_middleware_1.authenticate, validation_middleware_1.validate(validation_middleware_1.validateCreateOrUpdateVendorOpeningHours), vendorOpeningHoursController.updateVendorOpeningHours);
router.get('/', auth_middleware_1.authenticate, vendorOpeningHoursController.getAllVendorOpeningHours);
//router.get('/:id', vendorOpeningHoursController.getVendorOpeningHoursById);
/* router.put('/:id', vendorOpeningHoursController.updateVendorOpeningHours);
router.delete('/:id', vendorOpeningHoursController.deleteVendorOpeningHours); */
exports["default"] = router;
