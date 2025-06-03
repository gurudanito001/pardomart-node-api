"use strict";
exports.__esModule = true;
// routes/tag.routes.ts
var express_1 = require("express");
var feeController = require("../controllers/fee.controllers");
var router = express_1["default"].Router();
router.post('/', feeController.createFeeController);
router.get('/current', feeController.getCurrentFeesController);
router.get('/current/:type', feeController.getCurrentFeesController);
router.patch('/:id', feeController.updateFeeController);
router.patch('/deactivate/:type', feeController.deactivateFeeController);
router["delete"]('/:id', feeController.deactivateFeeController);
exports["default"] = router;
