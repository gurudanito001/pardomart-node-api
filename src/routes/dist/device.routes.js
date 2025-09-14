"use strict";
exports.__esModule = true;
// src/routes/device.routes.ts
var express_1 = require("express");
var device_controller_1 = require("../controllers/device.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var express_validator_1 = require("express-validator");
var router = express_1["default"].Router();
var validateRegisterDevice = [
    express_validator_1.body('fcmToken').isString().notEmpty().withMessage('fcmToken is required.'),
    express_validator_1.body('platform').isIn(['ios', 'android', 'web']).withMessage('Platform must be ios, android, or web.'),
];
var validateUnregisterDevice = [express_validator_1.param('fcmToken').isString().notEmpty().withMessage('fcmToken is required in path.')];
router.post('/', auth_middleware_1.authenticate, express_validator_1.validate(validateRegisterDevice), device_controller_1.registerDeviceController);
router["delete"]('/:fcmToken', auth_middleware_1.authenticate, express_validator_1.validate(validateUnregisterDevice), device_controller_1.unregisterDeviceController);
exports["default"] = router;
