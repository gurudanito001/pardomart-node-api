"use strict";
exports.__esModule = true;
// routes/user.routes.ts
var express_1 = require("express");
var userController = require("../controllers/user.controllers");
var router = express_1["default"].Router();
// User Routes
router.get('/verificationCodes', userController.getAllVerificationCodes);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
//router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router["delete"]('/:id', userController.deleteUser);
//router.post('/user/support', userController.createSupport);
exports["default"] = router;
