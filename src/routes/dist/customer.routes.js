"use strict";
exports.__esModule = true;
// routes/customer.routes.ts
var express_1 = require("express");
var customerController = require("../controllers/customer.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
router.get('/', auth_middleware_1.authenticate, customerController.listCustomersController);
exports["default"] = router;
