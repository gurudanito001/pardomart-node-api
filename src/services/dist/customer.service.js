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
exports.listCustomerTransactionsService = exports.listCustomersService = void 0;
// services/customer.service.ts
var client_1 = require("@prisma/client");
var customerModel = require("../models/customer.model");
var prisma = new client_1.PrismaClient();
/**
 * Retrieves a list of customers for a vendor or a specific store.
 * @param options - The filtering options.
 * @returns A list of unique customer users.
 */
exports.listCustomersService = function (options) { return __awaiter(void 0, void 0, Promise, function () {
    var ownerId, vendorId;
    return __generator(this, function (_a) {
        ownerId = options.ownerId, vendorId = options.vendorId;
        if (!ownerId && !vendorId) {
            throw new Error('Either ownerId or vendorId must be provided.');
        }
        return [2 /*return*/, customerModel.listCustomers(options)];
    });
}); };
/**
 * Retrieves transactions for a specific customer, with role-based authorization.
 * @param requestingUserId - The ID of the user making the request.
 * @param requestingUserRole - The role of the user making the request.
 * @param staffVendorId - The vendor ID from the staff member's token (for store_admin).
 * @param filterByVendorId - An optional store ID to filter by (for vendors).
 * @param customerId - The ID of the customer.
 * @returns A list of transactions.
 */
exports.listCustomerTransactionsService = function (requestingUserId, requestingUserRole, staffVendorId, filterByVendorId, customerId) { return __awaiter(void 0, void 0, void 0, function () {
    var modelFilters, _a, vendor;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                modelFilters = {
                    customerId: customerId
                };
                _a = requestingUserRole;
                switch (_a) {
                    case client_1.Role.vendor: return [3 /*break*/, 1];
                    case client_1.Role.store_admin: return [3 /*break*/, 4];
                }
                return [3 /*break*/, 5];
            case 1:
                modelFilters.ownerId = requestingUserId;
                if (!filterByVendorId) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.vendor.findFirst({
                        where: { id: filterByVendorId, userId: requestingUserId }
                    })];
            case 2:
                vendor = _b.sent();
                if (!vendor) {
                    throw new Error('Forbidden: You do not own this store or store not found.');
                }
                modelFilters.vendorId = filterByVendorId;
                _b.label = 3;
            case 3: return [3 /*break*/, 6];
            case 4:
                if (!staffVendorId) {
                    throw new Error('Forbidden: You are not assigned to a store.');
                }
                // A store admin can ONLY see transactions for their assigned store.
                modelFilters.vendorId = staffVendorId;
                return [3 /*break*/, 6];
            case 5: throw new Error('Forbidden: You do not have permission to perform this action.');
            case 6: 
            // 2. Retrieve transactions using the constructed filters.
            // The model will handle validation of whether the customer has history.
            return [2 /*return*/, customerModel.listCustomerTransactions(modelFilters)];
        }
    });
}); };
