"use strict";
exports.__esModule = true;
var express_1 = require("express");
var authController = require("../controllers/auth.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
// New Router instance
var router = express_1.Router();
// Authentication Routes
router.post('/register', validation_middleware_1.validate(validation_middleware_1.validateRegisterUser), authController.registerUser);
router.get('/getTimeZones', authController.getTimeZones);
router.post('/resendVerification', validation_middleware_1.validate(validation_middleware_1.validateResendVerification), authController.resendVerificationCode);
router.post('/initiateLogin', validation_middleware_1.validate(validation_middleware_1.validateLogin), authController.initiateLogin);
router.post('/verifyAndLogin', validation_middleware_1.validate(validation_middleware_1.validateVerifyAndLogin), authController.verifyCodeAndLogin);
exports["default"] = router;
