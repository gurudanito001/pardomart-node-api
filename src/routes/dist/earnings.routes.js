"use strict";
exports.__esModule = true;
// src/routes/earnings.routes.ts
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
var earnings_controller_1 = require("../controllers/earnings.controller");
var router = express_1.Router();
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.vendor]));
router.get('/', earnings_controller_1.listEarningsController);
exports["default"] = router;
