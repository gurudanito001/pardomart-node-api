"use strict";
exports.__esModule = true;
// routes/user.routes.ts
var express_1 = require("express");
var userController = require("../controllers/user.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var client_1 = require("@prisma/client");
var router = express_1["default"].Router();
// User Routes
// Note: These routes are protected and require admin privileges.
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]));
router.get('/verificationCodes', userController.getAllVerificationCodes);
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetAllUsers), userController.getAllUsers);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateUserId), userController.getUserById);
// router.post('/', userController.createUser); // Create user is handled by /auth/register
router.put('/:id', validation_middleware_1.validate(validation_middleware_1.validateUpdateUser), userController.updateUser);
router["delete"]('/:id', validation_middleware_1.validate(validation_middleware_1.validateUserId), userController.deleteUser);
//router.post('/user/support', userController.createSupport);
exports["default"] = router;
