"use strict";
exports.__esModule = true;
var express_1 = require("express");
var authController = require("../controllers/auth.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
// New Router instance
var router = express_1.Router();
// Authentication Routes
router.post('/register', /* smsLimiter */ validation_middleware_1.validate(validation_middleware_1.validateRegisterUser), authController.registerUser);
router.get('/time-zones', authController.getTimeZones);
router.post('/initiate-login', /* smsLimiter */ validation_middleware_1.validate(validation_middleware_1.validateLogin), authController.initiateLogin);
router.post('/verify-login', validation_middleware_1.validate(validation_middleware_1.validateVerifyAndLogin), authController.verifyCodeAndLogin);
exports["default"] = router;
