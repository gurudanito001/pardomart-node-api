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
exports.listCustomersController = void 0;
var customerService = require("../services/customer.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management for vendors
 */
/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List customers for a vendor, admin, or shopper
 *     tags: [Customers]
 *     description: >
 *       Retrieves a list of unique customers who have patronized a store.
 *       - **Vendor**: Can see customers from all their stores. Can filter by a specific `vendorId`.
 *       - **Store Admin/Shopper**: Can only see customers from their assigned store. The `vendorId` filter is ignored.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. For vendors, filters customers by a specific store ID. For staff, this parameter is ignored.
 *     responses:
 *       200:
 *         description: A list of customers who have made a purchase from the vendor's store(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSummary'
 *       403:
 *         description: Forbidden. The authenticated user does not have permission.
 *       500:
 *         description: Internal server error.
 */
exports.listCustomersController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, staffVendorId, queryVendorId, vendorIdToQuery, ownerId, customers, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                userRole = req.userRole;
                staffVendorId = req.vendorId;
                queryVendorId = req.query.vendorId;
                vendorIdToQuery = void 0;
                ownerId = void 0;
                if (userRole === client_1.Role.vendor) {
                    ownerId = userId;
                    vendorIdToQuery = queryVendorId; // A vendor can filter by any of their stores
                }
                else {
                    // For staff, they can only see customers of their assigned store.
                    // Any query for a different store is an error.
                    if (queryVendorId && queryVendorId !== staffVendorId) {
                        return [2 /*return*/, res.status(403).json({ error: 'Forbidden: You can only access customers for your assigned store.' })];
                    }
                    vendorIdToQuery = staffVendorId;
                }
                return [4 /*yield*/, customerService.listCustomersService({ ownerId: ownerId, vendorId: vendorIdToQuery })];
            case 1:
                customers = _a.sent();
                res.status(200).json(customers);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error listing customers:', error_1);
                if (error_1.message.includes('Unauthorized')) {
                    return [2 /*return*/, res.status(403).json({ error: error_1.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred while listing customers.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
