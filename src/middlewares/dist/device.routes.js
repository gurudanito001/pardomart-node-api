"use strict";
exports.__esModule = true;
// src/routes/device.routes.ts
var express_1 = require("express");
var device_controller_1 = require("../controllers/device.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
router.post('/', auth_middleware_1.authenticate, validation_middleware_1.validate(validation_middleware_1.validateRegisterDevice), device_controller_1.registerDeviceController);
router["delete"]('/:fcmToken', auth_middleware_1.authenticate, validation_middleware_1.validate(validation_middleware_1.validateUnregisterDevice), device_controller_1.unregisterDeviceController);
exports["default"] = router;
