"use strict";
exports.__esModule = true;
var express_1 = require("express");
var deliveryAddress_controllers_1 = require("../controllers/deliveryAddress.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware");
// --- DeliveryAddress Routes ---
var router = express_1.Router();
router.post('/', auth_middleware_1.authenticate, deliveryAddress_controllers_1.createDeliveryAddressController);
router.get('/me/default', auth_middleware_1.authenticate, deliveryAddress_controllers_1.getMyDefaultDeliveryAddressController); // Get default address for authenticated user
router.get('/me', auth_middleware_1.authenticate, deliveryAddress_controllers_1.getMyDeliveryAddressesController); // Get all addresses for the authenticated user
router.get('/:id', auth_middleware_1.authenticate, deliveryAddress_controllers_1.getDeliveryAddressByIdController);
router.put('/:id', auth_middleware_1.authenticate, deliveryAddress_controllers_1.updateDeliveryAddressController);
router["delete"]('/:id', auth_middleware_1.authenticate, deliveryAddress_controllers_1.deleteDeliveryAddressController);
router.patch('/:id/set-default', auth_middleware_1.authenticate, deliveryAddress_controllers_1.setDefaultDeliveryAddressController); // Set an address as default
exports["default"] = router;
