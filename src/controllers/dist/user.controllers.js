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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllVerificationCodes = exports.getAllUsers = void 0;
var userService = require("../services/user.service"); // Assuming you have a user.service.ts file
// User Controllers
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a paginated list of users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mobileVerified
 *         schema:
 *           type: boolean
 *         description: Filter by mobile verification status.
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status.
 *       - in: query
 *         name: role
 *         schema:
 *           $ref: '#/components/schemas/Role'
 *         description: Filter by user role.
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       enum: [admin, vendor, store_shopper, delivery, customer, shopper]
 *     Verification:
 *       type: object
 *       properties:
 *         mobileNumber:
 *           type: string
 *         code:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         attempts:
 *           type: integer
 *           nullable: true
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         mobileNumber: { type: string }
 *         mobileVerified: { type: boolean }
 *         dynamicMediaUrls: { type: object, nullable: true }
 *         active: { type: boolean }
 *         language: { type: string, nullable: true }
 *         notification: { type: object, nullable: true }
 *         rememberToken: { type: string, nullable: true }
 *         stripeCustomerId: { type: string, nullable: true }
 *         referralCode: { type: string, nullable: true }
 *         role: { $ref: '#/components/schemas/Role' }
 *         vendorId: { type: string, format: uuid, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     PaginatedUsers:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         totalPages: { type: integer }
 *         pageSize: { type: integer }
 *         totalCount: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *     UpdateUserPayload:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         mobileNumber: { type: string }
 *         role: { $ref: '#/components/schemas/Role' }
 *         mobileVerified: { type: boolean }
 *         active: { type: boolean }
 *         language: { type: string }
 *         notification: { type: object }
 *         referralCode: { type: string }
 */
exports.getAllUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobileVerified, active, role, language, page, size, filters, pagination, users, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, mobileVerified = _a.mobileVerified, active = _a.active, role = _a.role, language = _a.language, page = _a.page, size = _a.size;
                filters = {
                    mobileVerified: mobileVerified,
                    active: active,
                    role: role,
                    language: language
                };
                pagination = {
                    page: page || 1,
                    take: size || 20
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, userService.getAllUsers(filters, pagination)];
            case 2:
                users = _b.sent();
                res.status(200).json(users);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('Error getting all users:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /users/verificationCodes:
 *   get:
 *     summary: Get all verification codes
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves all stored verification codes. Intended for admin/debugging purposes.
 *     responses:
 *       200:
 *         description: A list of all verification codes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Verification' }
 */
exports.getAllVerificationCodes = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var verificationCodes, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, userService.getAllVerificationCodes()];
            case 1:
                verificationCodes = _a.sent();
                res.status(200).json(verificationCodes);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting all verification codes:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by their ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: The requested user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 */
exports.getUserById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.id;
                return [4 /*yield*/, userService.getUserById(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                res.status(200).json(user);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error getting user by ID:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/*
 * Note: The createUser endpoint is handled by /auth/register,
 * so this controller is not currently exposed in the routes.
 */
exports.createUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newUser, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, userService.createUser(req.body)];
            case 1:
                newUser = _a.sent();
                res.status(201).json(newUser);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error creating user:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user's details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *     responses:
 *       200:
 *         description: The updated user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 */
exports.updateUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, updatedUser, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.id;
                return [4 /*yield*/, userService.updateUser(__assign({ id: userId }, req.body))];
            case 1:
                updatedUser = _a.sent();
                res.status(200).json(updatedUser);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error updating user:', error_5);
                if ((error_5 === null || error_5 === void 0 ? void 0 : error_5.code) === 'P2025') { // Prisma's error code for record not found on update
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to delete.
 *     responses:
 *       200:
 *         description: The deleted user.
 *       404:
 *         description: User not found.
 */
exports.deleteUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, deletedUser, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.id;
                return [4 /*yield*/, userService.deleteUser(userId)];
            case 1:
                deletedUser = _a.sent();
                res.status(200).json(deletedUser);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error deleting user:', error_6);
                if ((error_6 === null || error_6 === void 0 ? void 0 : error_6.code) === 'P2025') { // Prisma's error code for record not found on delete
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
