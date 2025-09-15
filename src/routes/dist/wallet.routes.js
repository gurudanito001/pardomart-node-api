"use strict";
exports.__esModule = true;
var express_1 = require("express");
var walletController = require("../controllers/wallet.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
// All wallet routes require an authenticated user
router.use(auth_middleware_1.authenticate);
router.get('/me', walletController.getMyWalletController);
router.get('/me/transactions', walletController.getMyWalletTransactionsController);
exports["default"] = router;
