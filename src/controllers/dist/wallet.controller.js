"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getMyWalletTransactionsController = exports.getMyWalletController = void 0;
var wallet_service_1 = require("../services/wallet.service");
/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: User wallet management
 */
/**
 * @swagger
 * /api/v1/wallet/me:
 *   get:
 *     summary: Get my wallet
 *     tags: [Wallet]
 *     description: Retrieves the wallet details and balance for the authenticated user. A wallet is created automatically on first access.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's wallet.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
exports.getMyWalletController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, wallet, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, wallet_service_1.getWalletByUserIdService(userId)];
            case 1:
                wallet = _a.sent();
                res.status(200).json(wallet);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error getting wallet:', error_1);
                res.status(500).json({ error: 'Failed to retrieve wallet.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/wallet/me/transactions:
 *   get:
 *     summary: Get my wallet transactions
 *     tags: [Wallet]
 *     description: Retrieves the transaction history for the authenticated user's wallet.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of wallet transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WalletTransaction'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
exports.getMyWalletTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, transactions, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, wallet_service_1.getWalletTransactionsService(userId)];
            case 1:
                transactions = _a.sent();
                res.status(200).json(transactions);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting wallet transactions:', error_2);
                res.status(500).json({ error: 'Failed to retrieve wallet transactions.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
