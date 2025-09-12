"use strict";
exports.__esModule = true;
var express_1 = require("express");
var deliveryAddressController = require("../controllers/deliveryAddress.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
// All routes in this file are protected and require authentication
router.use(auth_middleware_1.authenticate);
// Create a new delivery address
router.post('/', validation_middleware_1.validate(validation_middleware_1.validateCreateDeliveryAddress), deliveryAddressController.createDeliveryAddressController);
// Get all delivery addresses for the authenticated user
router.get('/me', deliveryAddressController.getMyDeliveryAddressesController);
// Get the default delivery address for the authenticated user
router.get('/me/default', deliveryAddressController.getMyDefaultDeliveryAddressController);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteDeliveryAddress), deliveryAddressController.getDeliveryAddressByIdController);
router.put('/:id', validation_middleware_1.validate(validation_middleware_1.validateUpdateDeliveryAddress), deliveryAddressController.updateDeliveryAddressController);
router["delete"]('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteDeliveryAddress), deliveryAddressController.deleteDeliveryAddressController);
router.patch('/:id/set-default', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteDeliveryAddress), deliveryAddressController.setDefaultDeliveryAddressController);
exports["default"] = router;
