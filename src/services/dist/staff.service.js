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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.listStaffTransactionsService = exports.deleteStaffService = exports.updateStaffService = exports.getStaffByIdService = exports.listStaffService = exports.listStaffByVendorIdService = exports.createStaffService = void 0;
// services/staff.service.ts
var staffModel = require("../models/staff.model");
var vendorModel = require("../models/vendor.model");
var client_1 = require("@prisma/client");
var client_2 = require("@prisma/client");
var prisma = new client_2.PrismaClient();
var sanitizeUser = function (user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var rememberToken = user.rememberToken, sanitized = __rest(user, ["rememberToken"]);
    return sanitized;
};
/**
 * Creates a new staff member for a vendor.
 * @param payload - The details for the new staff member.
 * @returns The created user object, without the password.
 */
exports.createStaffService = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor, staffData, newUser, rememberToken, userWithoutPassword;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.vendor.findFirst({
                    where: { id: payload.vendorId, userId: payload.ownerId }
                })];
            case 1:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Unauthorized: You do not own this vendor.');
                }
                staffData = {
                    name: payload.name,
                    email: payload.email,
                    mobileNumber: payload.mobileNumber,
                    vendorId: payload.vendorId
                };
                return [4 /*yield*/, staffModel.createStaff(staffData)];
            case 2:
                newUser = _a.sent();
                rememberToken = newUser.rememberToken, userWithoutPassword = __rest(newUser, ["rememberToken"]);
                return [2 /*return*/, userWithoutPassword];
        }
    });
}); };
/**
 * Retrieves a list of staff members for a specific store, ensuring the requester is the owner.
 * @param vendorId - The ID of the store.
 * @param ownerId - The ID of the user requesting the list.
 * @returns A list of staff users.
 */
exports.listStaffByVendorIdService = function (vendorId, ownerId) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor, staffList;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.vendor.findFirst({
                    where: { id: vendorId, userId: ownerId }
                })];
            case 1:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Unauthorized: You do not own this vendor.');
                }
                return [4 /*yield*/, staffModel.listStaffByVendorId(vendorId)];
            case 2:
                staffList = _a.sent();
                return [2 /*return*/, staffList.map(sanitizeUser)];
        }
    });
}); };
/**
 * Retrieves a list of all staff members across all stores owned by a user.
 * @param ownerId - The user ID of the vendor owner.
 * @returns A list of all staff users.
 */
exports.listStaffService = function (options) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, userRole, staffVendorId, filterByVendorId, staffList, _a, vendor;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = options.userId, userRole = options.userRole, staffVendorId = options.staffVendorId, filterByVendorId = options.vendorId;
                staffList = [];
                _a = userRole;
                switch (_a) {
                    case client_1.Role.vendor: return [3 /*break*/, 1];
                    case client_1.Role.store_admin: return [3 /*break*/, 5];
                    case client_1.Role.store_shopper: return [3 /*break*/, 7];
                }
                return [3 /*break*/, 8];
            case 1:
                if (!filterByVendorId) return [3 /*break*/, 3];
                return [4 /*yield*/, vendorModel.getVendorById(filterByVendorId)];
            case 2:
                vendor = _b.sent();
                if (!vendor || vendor.userId !== userId) {
                    throw new Error('Forbidden: You are not authorized to view staff for this store.');
                }
                _b.label = 3;
            case 3: return [4 /*yield*/, staffModel.listStaffByOwnerId(userId, filterByVendorId)];
            case 4:
                // A vendor owner can get all staff, or filter by a specific vendorId they own.
                staffList = _b.sent();
                return [3 /*break*/, 9];
            case 5:
                // A store admin gets all staff from their assigned store.
                if (!staffVendorId) {
                    throw new Error('Store admin is not associated with a vendor.');
                }
                return [4 /*yield*/, staffModel.listStaffByVendorId(staffVendorId)];
            case 6:
                staffList = _b.sent();
                return [3 /*break*/, 9];
            case 7: 
            // A store shopper is not permitted to list other staff members.
            throw new Error('Unauthorized role.');
            case 8: throw new Error('Unauthorized role.');
            case 9: return [2 /*return*/, staffList.map(sanitizeUser)];
        }
    });
}); };
/**
 * Retrieves a single staff member, ensuring the requester is the owner.
 * @param staffId - The ID of the staff user.
 * @param ownerId - The ID of the user requesting the staff member.
 * @returns A user object or null if not found.
 */
exports.getStaffByIdService = function (staffId, ownerId) { return __awaiter(void 0, void 0, Promise, function () {
    var staffUser, vendor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, staffModel.getStaffById(staffId)];
            case 1:
                staffUser = _a.sent();
                if (!staffUser || !staffUser.vendorId) {
                    return [2 /*return*/, null]; // Staff not found or not associated with any vendor
                }
                return [4 /*yield*/, prisma.vendor.findFirst({
                        where: { id: staffUser.vendorId, userId: ownerId }
                    })];
            case 2:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Unauthorized: You do not own the vendor this staff member belongs to.');
                }
                return [2 /*return*/, sanitizeUser(staffUser)];
        }
    });
}); };
/**
 * Updates a staff member's details.
 * @param payload - The update payload containing staffId, ownerId, and new details.
 * @returns The updated user object.
 */
exports.updateStaffService = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var staffId, ownerId, updateData, staffUser, vendor, updatedUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                staffId = payload.staffId, ownerId = payload.ownerId, updateData = __rest(payload, ["staffId", "ownerId"]);
                return [4 /*yield*/, staffModel.getStaffById(staffId)];
            case 1:
                staffUser = _a.sent();
                if (!staffUser || !staffUser.vendorId) {
                    throw new Error('Staff member not found.');
                }
                return [4 /*yield*/, prisma.vendor.findFirst({
                        where: { id: staffUser.vendorId, userId: ownerId }
                    })];
            case 2:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Unauthorized: You do not own the vendor this staff member belongs to.');
                }
                return [4 /*yield*/, staffModel.updateStaff(staffId, updateData)];
            case 3:
                updatedUser = _a.sent();
                return [2 /*return*/, sanitizeUser(updatedUser)];
        }
    });
}); };
/**
 * Deletes a staff member's account.
 * @param staffId - The ID of the staff user to delete.
 * @param ownerId - The ID of the user requesting the deletion.
 * @returns The deleted user object.
 */
exports.deleteStaffService = function (staffId, ownerId) { return __awaiter(void 0, void 0, Promise, function () {
    var staffUser, vendor, deletedUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, staffModel.getStaffById(staffId)];
            case 1:
                staffUser = _a.sent();
                if (!staffUser || !staffUser.vendorId) {
                    throw new Error('Staff member not found.');
                }
                return [4 /*yield*/, prisma.vendor.findFirst({
                        where: { id: staffUser.vendorId, userId: ownerId }
                    })];
            case 2:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Unauthorized: You do not own the vendor this staff member belongs to.');
                }
                // Ensure one cannot delete a user who is not a staff member
                if (staffUser.role !== client_1.Role.store_shopper) {
                    throw new Error('This user is not a staff member and cannot be deleted through this endpoint.');
                }
                return [4 /*yield*/, staffModel.deleteStaff(staffId)];
            case 3:
                deletedUser = _a.sent();
                return [2 /*return*/, sanitizeUser(deletedUser)];
        }
    });
}); };
/**
 * Handles authorization and determines query scope for a vendor.
 * @private
 */
var _getScopeForVendor = function (requestingUserId, filter) { return __awaiter(void 0, void 0, Promise, function () {
    var ownerId, vendor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ownerId = requestingUserId;
                if (!filter.vendorId) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma.vendor.findFirst({ where: { id: filter.vendorId, userId: ownerId } })];
            case 1:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Vendor not found or you are not authorized to view its transactions.');
                }
                _a.label = 2;
            case 2: return [2 /*return*/, { ownerId: ownerId, vendorId: filter.vendorId }];
        }
    });
}); };
/**
 * Handles authorization and determines query scope for a store admin.
 * @private
 */
var _getScopeForStoreAdmin = function (staffVendorId, filter) { return __awaiter(void 0, void 0, Promise, function () {
    var store;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!staffVendorId) {
                    throw new Error('Forbidden: You are not assigned to a store.');
                }
                // A store admin can only see transactions for their own store.
                // They cannot query for other stores.
                if (filter.vendorId && filter.vendorId !== staffVendorId) {
                    throw new Error('Forbidden: You can only view transactions for your assigned store.');
                }
                return [4 /*yield*/, prisma.vendor.findUnique({ where: { id: staffVendorId }, select: { userId: true } })];
            case 1:
                store = _a.sent();
                if (!store)
                    throw new Error('Assigned store not found.');
                return [2 /*return*/, { ownerId: store.userId, vendorId: staffVendorId }];
        }
    });
}); };
/**
 * Retrieves transactions for staff members based on the requester's role.
 * @param options - The options for listing transactions, including authorization details and filters.
 * @returns A list of transactions.
 */
exports.listStaffTransactionsService = function (options) { return __awaiter(void 0, void 0, Promise, function () {
    var requestingUserId, requestingUserRole, staffVendorId, filter, scope, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                requestingUserId = options.requestingUserId, requestingUserRole = options.requestingUserRole, staffVendorId = options.staffVendorId, filter = options.filter;
                _a = requestingUserRole;
                switch (_a) {
                    case client_1.Role.vendor: return [3 /*break*/, 1];
                    case client_1.Role.store_admin: return [3 /*break*/, 3];
                }
                return [3 /*break*/, 5];
            case 1: return [4 /*yield*/, _getScopeForVendor(requestingUserId, filter)];
            case 2:
                scope = _b.sent();
                return [3 /*break*/, 6];
            case 3: return [4 /*yield*/, _getScopeForStoreAdmin(staffVendorId, filter)];
            case 4:
                scope = _b.sent();
                return [3 /*break*/, 6];
            case 5: throw new Error('Forbidden: You do not have permission to view staff transactions.');
            case 6: 
            // The model function expects the ownerId to correctly scope the query.
            return [2 /*return*/, staffModel.listStaffTransactions({
                    ownerId: scope.ownerId,
                    vendorId: scope.vendorId,
                    staffUserId: filter.staffUserId
                })];
        }
    });
}); };
