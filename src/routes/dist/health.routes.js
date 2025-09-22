"use strict";
exports.__esModule = true;
var express_1 = require("express");
var health_controller_1 = require("../controllers/health.controller");
var router = express_1.Router();
router.get('/', health_controller_1.healthCheckController);
exports["default"] = router;
