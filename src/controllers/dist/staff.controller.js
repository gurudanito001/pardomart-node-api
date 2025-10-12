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
exports.deleteStaffController = exports.updateStaffController = exports.getStaffByIdController = exports.listStaffByVendorController = exports.listStaffForVendorOrAdminController = exports.listStaffTransactionsController = exports.createStaffController = void 0;
var staffService = require("../services/staff.service");
/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Vendor staff management
 */
/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a new staff member (shopper) for a vendor
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, mobileNumber, vendorId]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               mobileNumber: { type: string }
 *               vendorId: { type: string, format: uuid, description: "The ID of the store this staff belongs to." }
 *     responses:
 *       201:
 *         description: Staff account created successfully.
 *       403:
 *         description: Forbidden. The authenticated user does not own the vendor.
 */
exports.createStaffController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, staff, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                return [4 /*yield*/, staffService.createStaffService(__assign(__assign({}, req.body), { ownerId: ownerId }))];
            case 1:
                staff = _a.sent();
                res.status(201).json(staff);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error creating staff:', error_1);
                res.status(500).json({ error: error_1.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /staff/transactions:
 *   get:
 *     summary: List all transactions for a vendor's staff
 *     tags: [Staff, Transactions]
 *     description: >
 *       Retrieves a list of all transactions for staff members belonging to the authenticated vendor.
 *       Can be filtered by a specific `staffUserId` and/or `vendorId` (store ID).
 *       If no filters are provided, it fetches transactions for all staff across all stores owned by the vendor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffUserId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter transactions for a specific staff member.
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter transactions for staff at a specific store.
 *     responses:
 *       200:
 *         description: A list of staff transactions.
 *       403:
 *         description: Forbidden if the user tries to access a vendor or staff they do not own.
 *       404:
 *         description: Not Found if the specified `staffUserId` or `vendorId` does not exist.
 *       500:
 *         description: Internal server error.
 */
exports.listStaffTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, _a, staffUserId, vendorId, transactions, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                _a = req.query, staffUserId = _a.staffUserId, vendorId = _a.vendorId;
                return [4 /*yield*/, staffService.listStaffTransactionsService(ownerId, { staffUserId: staffUserId, vendorId: vendorId })];
            case 1:
                transactions = _b.sent();
                res.status(200).json(transactions);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error listing staff transactions:', error_2);
                if (error_2.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_2.message })];
                }
                if (error_2.message.includes('not authorized')) {
                    return [2 /*return*/, res.status(403).json({ error: error_2.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred while fetching staff transactions.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /staff:
 *   get:
 *     summary: List staff members based on user role
 *     tags: [Staff]
 *     description: >
 *       Retrieves a list of staff members with role-based access:
 *       - **Vendor**: Can see all staff members across all of their stores.
 *       - **Store Admin**: Can only see staff members from their assigned store.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of staff members.
 *       500:
 *         description: Internal server error.
 */
exports.listStaffForVendorOrAdminController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, staffVendorId, staffList, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                userRole = req.userRole;
                staffVendorId = req.vendorId;
                return [4 /*yield*/, staffService.listStaffService({ userId: userId, userRole: userRole, staffVendorId: staffVendorId })];
            case 1:
                staffList = _a.sent();
                res.status(200).json(staffList);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error listing staff:', error_3);
                if (error_3.message.includes('Unauthorized') || error_3.message.includes('not associated')) {
                    return [2 /*return*/, res.status(403).json({ error: error_3.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred while listing staff.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /staff/store/{vendorId}:
 *   get:
 *     summary: List all staff members for a specific store
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: A list of staff members for the specified store.
 *       403:
 *         description: Forbidden. The authenticated user does not own the vendor.
 */
exports.listStaffByVendorController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, vendorId, staffList, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                vendorId = req.params.vendorId;
                return [4 /*yield*/, staffService.listStaffByVendorIdService(vendorId, ownerId)];
            case 1:
                staffList = _a.sent();
                res.status(200).json(staffList);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error listing staff by vendor:', error_4);
                res.status(500).json({ error: error_4.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /staff/{staffId}:
 *   get:
 *     summary: Get a single staff member by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The requested staff member.
 *       404:
 *         description: Staff member not found.
 *       403:
 *         description: Forbidden.
 */
exports.getStaffByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, staffId, staff, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                staffId = req.params.staffId;
                return [4 /*yield*/, staffService.getStaffByIdService(staffId, ownerId)];
            case 1:
                staff = _a.sent();
                if (!staff) {
                    return [2 /*return*/, res.status(404).json({ error: 'Staff member not found.' })];
                }
                res.status(200).json(staff);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error getting staff by ID:', error_5);
                res.status(500).json({ error: error_5.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /staff/{staffId}:
 *   patch:
 *     summary: Update a staff member's details
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               mobileNumber: { type: string }
 *               active: { type: boolean, description: "Use to deactivate/reactivate account" }
 *     responses:
 *       200:
 *         description: The updated staff member.
 */
exports.updateStaffController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, staffId, updatedStaff, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                staffId = req.params.staffId;
                return [4 /*yield*/, staffService.updateStaffService(__assign(__assign({}, req.body), { staffId: staffId, ownerId: ownerId }))];
            case 1:
                updatedStaff = _a.sent();
                res.status(200).json(updatedStaff);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error updating staff:', error_6);
                res.status(500).json({ error: error_6.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /staff/{staffId}:
 *   delete:
 *     summary: Delete a staff member's account
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Staff member deleted successfully.
 */
exports.deleteStaffController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, staffId, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                staffId = req.params.staffId;
                return [4 /*yield*/, staffService.deleteStaffService(staffId, ownerId)];
            case 1:
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error deleting staff:', error_7);
                res.status(500).json({ error: error_7.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
