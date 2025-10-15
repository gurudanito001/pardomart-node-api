"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.listStaffTransactions = exports.deleteStaff = exports.updateStaff = exports.getStaffById = exports.listStaffByOwnerId = exports.listStaffByVendorId = exports.createStaff = void 0;
// models/staff.model.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
/**
 * Creates a new staff user in the database.
 * @param payload - The staff user's details.
 * @returns The newly created user.
 */
exports.createStaff = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var staffUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.create({
                    data: __assign(__assign({}, payload), { role: client_1.Role.store_shopper })
                })];
            case 1:
                staffUser = _a.sent();
                // We don't need to explicitly connect the vendor,
                // as the `vendorId` field on the User model handles the relation.
                return [2 /*return*/, staffUser];
        }
    });
}); };
/**
 * Retrieves a list of staff members (shoppers) for a specific store.
 * @param vendorId - The ID of the vendor/store.
 * @returns A list of staff users.
 */
exports.listStaffByVendorId = function (vendorId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.user.findMany({
                where: {
                    vendorId: vendorId,
                    role: client_1.Role.store_shopper
                }
            })];
    });
}); };
/**
 * Retrieves a list of all staff members (shoppers) under a vendor owner's account.
 * @param ownerId - The user ID of the vendor owner.
 * @returns A list of all staff users across all stores owned by the user.
 */
exports.listStaffByOwnerId = function (ownerId, vendorId) { return __awaiter(void 0, void 0, Promise, function () {
    var whereClause;
    return __generator(this, function (_a) {
        whereClause = {
            role: { "in": [client_1.Role.store_shopper, client_1.Role.store_admin] },
            vendor: {
                userId: ownerId
            }
        };
        if (vendorId) {
            whereClause.vendorId = vendorId;
        }
        return [2 /*return*/, prisma.user.findMany({
                where: whereClause,
                include: {
                    vendor: {
                        select: {
                            name: true
                        }
                    }
                }
            })];
    });
}); };
/**
 * Retrieves a single staff member by their ID.
 * @param staffId - The ID of the staff user.
 * @returns A user object or null if not found or not a staff member.
 */
exports.getStaffById = function (staffId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.user.findFirst({
                where: {
                    id: staffId,
                    role: { "in": [client_1.Role.store_shopper, client_1.Role.store_admin] }
                }
            })];
    });
}); };
/**
 * Updates the details of a staff member.
 * @param staffId - The ID of the staff user to update.
 * @param payload - The data to update.
 * @returns The updated user object.
 */
exports.updateStaff = function (staffId, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.user.update({
                where: { id: staffId },
                data: payload
            })];
    });
}); };
/**
 * Deletes a staff member's account.
 * @param staffId - The ID of the staff user to delete.
 * @returns The deleted user object.
 */
exports.deleteStaff = function (staffId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        // Authorization to ensure the user is a staff member should be handled in the service layer
        // before calling this function.
        return [2 /*return*/, prisma.user["delete"]({
                where: { id: staffId }
            })];
    });
}); };
/**
 * Retrieves transactions for staff members under a vendor owner's account.
 * @param filters - The filters to apply, including ownerId and optional staffUserId/vendorId.
 * @returns A list of transactions.
 */
exports.listStaffTransactions = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    var ownerId, staffUserId, vendorId, staffWhere, staffMembers, staffIds, transactionWhere;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ownerId = filters.ownerId, staffUserId = filters.staffUserId, vendorId = filters.vendorId;
                staffWhere = {
                    role: { "in": [client_1.Role.store_shopper, client_1.Role.store_admin] },
                    vendor: {
                        userId: ownerId
                    }
                };
                if (staffUserId) {
                    staffWhere.id = staffUserId;
                }
                if (vendorId) {
                    staffWhere.vendorId = vendorId;
                }
                return [4 /*yield*/, prisma.user.findMany({
                        where: staffWhere,
                        select: { id: true }
                    })];
            case 1:
                staffMembers = _a.sent();
                if (staffMembers.length === 0) {
                    return [2 /*return*/, []]; // No matching staff, so no transactions.
                }
                staffIds = staffMembers.map(function (staff) { return staff.id; });
                transactionWhere = {
                    userId: { "in": staffIds }
                };
                // If filtering by a specific store, we can add it here too for query optimization.
                if (vendorId) {
                    transactionWhere.vendorId = vendorId;
                }
                return [2 /*return*/, prisma.transaction.findMany({
                        where: transactionWhere,
                        orderBy: { createdAt: 'desc' }
                    })];
        }
    });
}); };
