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
exports.getTotalEarningsController = exports.listEarningsController = void 0;
var earningsService = require("../services/earnings.service");
/**
 * @swagger
 * tags:
 *   name: Earnings
 *   description: Vendor earnings management
 */
/**
 * @swagger
 * /earnings:
 *   get:
 *     summary: List earnings for a vendor
 *     tags: [Earnings, Vendor]
 *     description: >
 *       Retrieves a list of all earnings (vendor payouts) for the authenticated vendor owner.
 *       Can be filtered by a specific `vendorId` (store ID) to see earnings for just one store.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter earnings for a specific store.
 *     responses:
 *       200:
 *         description: A list of earnings transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       403:
 *         description: Forbidden. The user is not a vendor or does not own the specified store.
 *       500:
 *         description: Internal server error.
 */
exports.listEarningsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestingUserId, vendorId, earnings, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requestingUserId = req.userId;
                vendorId = req.query.vendorId;
                return [4 /*yield*/, earningsService.listEarningsService({
                        requestingUserId: requestingUserId,
                        filterByVendorId: vendorId
                    })];
            case 1:
                earnings = _a.sent();
                res.status(200).json(earnings);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error listing earnings:', error_1);
                if (error_1.message.includes('Forbidden')) {
                    return [2 /*return*/, res.status(403).json({ error: error_1.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred while listing earnings.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /earnings/total:
 *   get:
 *     summary: Get total earnings for a vendor
 *     tags: [Earnings, Vendor]
 *     description: >
 *       Calculates and returns the total earnings for the authenticated vendor owner.
 *       The total can be filtered by a specific time period.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, 7days, 1month, 1year]
 *         description: |
 *           Optional. The time period to calculate earnings for.
 *           - `today`: From the beginning of the current day.
 *           - `7days`: For the last 7 days.
 *           - `1month`: For the last 1 month.
 *           - `1year`: For the last 1 year.
 *           If omitted, total earnings of all time are returned.
 *     responses:
 *       200:
 *         description: The total earnings amount.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEarnings:
 *                   type: number
 *                   format: float
 *       403:
 *         description: Forbidden. The user is not a vendor.
 *       500:
 *         description: Internal server error.
 */
exports.getTotalEarningsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestingUserId, period, totalEarnings, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requestingUserId = req.userId;
                period = req.query.period;
                return [4 /*yield*/, earningsService.getTotalEarningsService(requestingUserId, period)];
            case 1:
                totalEarnings = _a.sent();
                res.status(200).json({ totalEarnings: totalEarnings });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting total earnings:', error_2);
                res.status(500).json({ error: 'An unexpected error occurred while calculating earnings.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
