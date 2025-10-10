"use strict";
exports.__esModule = true;
var express_1 = require("express");
var walletController = require("../controllers/wallet.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
// GET /api/v1/wallet/me - Get the current user's wallet
router.get('/me', auth_middleware_1.authenticate, walletController.getWalletController);
// GET /api/v1/wallet/me/transactions - Get the current user's transaction history
router.get('/me/transactions', auth_middleware_1.authenticate, walletController.getWalletTransactionsController);
exports["default"] = router;
