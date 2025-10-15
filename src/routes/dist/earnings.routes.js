"use strict";
exports.__esModule = true;
var express_1 = require("express");
var earningsController = require("../controllers/earnings.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
var router = express_1.Router();
// All earnings routes are protected and restricted to users with the 'vendor' role.
router.use(auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.vendor]));
// Route to get total earnings
// GET /earnings/total
router.get('/total', earningsController.getTotalEarningsController);
// Route to list earnings transactions
// GET /earnings
router.get('/', earningsController.listEarningsController);
exports["default"] = router;
