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
exports.broadcastAnnouncementController = exports.deleteAnnouncementController = exports.updateAnnouncementController = exports.getAnnouncementsController = exports.createAnnouncementController = void 0;
var http_status_codes_1 = require("http-status-codes");
var announcementService = require("../services/announcement.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * tags:
 *   name: Announcement
 *   description: Announcement management
 */
/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create a new announcement (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, targetAudience]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [customer, vendor, store_admin, store_shopper, delivery_person, admin]
 *               isActive: { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: Announcement created.
 *       500:
 *         description: Server error.
 */
exports.createAnnouncementController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, targetAudience, isActive, imageUrl, roles, announcement, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, title = _a.title, description = _a.description, targetAudience = _a.targetAudience, isActive = _a.isActive;
                imageUrl = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
                roles = [];
                if (typeof targetAudience === 'string') {
                    if (targetAudience.includes(',')) {
                        roles = targetAudience.split(',').map(function (r) { return r.trim(); });
                    }
                    else {
                        roles = [targetAudience];
                    }
                }
                else if (Array.isArray(targetAudience)) {
                    roles = targetAudience;
                }
                if (roles.length === 0) {
                    return [2 /*return*/, res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'Target audience is required.' })];
                }
                return [4 /*yield*/, announcementService.createAnnouncementService({
                        title: title,
                        description: description,
                        imageUrl: imageUrl,
                        targetAudience: roles,
                        isActive: isActive === 'true' || isActive === true
                    })];
            case 1:
                announcement = _c.sent();
                res.status(http_status_codes_1.StatusCodes.CREATED).json(announcement);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                console.error('Error creating announcement:', error_1);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create announcement.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get all announcements (Admin sees all, Users see relevant)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of announcements.
 */
exports.getAnnouncementsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userRole, announcements, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userRole = req.userRole;
                announcements = void 0;
                if (!(userRole === client_1.Role.admin)) return [3 /*break*/, 2];
                return [4 /*yield*/, announcementService.getAllAnnouncementsService()];
            case 1:
                announcements = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, announcementService.getAnnouncementsForRoleService(userRole)];
            case 3:
                announcements = _a.sent();
                _a.label = 4;
            case 4:
                res.status(http_status_codes_1.StatusCodes.OK).json(announcements);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error('Error fetching announcements:', error_2);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch announcements.' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update an announcement (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *               targetAudience: { type: array, items: { type: string } }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated announcement.
 */
exports.updateAnnouncementController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, title, description, targetAudience, isActive, imageUrl, roles, updated, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, title = _a.title, description = _a.description, targetAudience = _a.targetAudience, isActive = _a.isActive;
                imageUrl = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
                roles = void 0;
                if (targetAudience) {
                    if (typeof targetAudience === 'string') {
                        if (targetAudience.includes(',')) {
                            roles = targetAudience.split(',').map(function (r) { return r.trim(); });
                        }
                        else {
                            roles = [targetAudience];
                        }
                    }
                    else if (Array.isArray(targetAudience)) {
                        roles = targetAudience;
                    }
                }
                return [4 /*yield*/, announcementService.updateAnnouncementService(id, {
                        title: title,
                        description: description,
                        imageUrl: imageUrl,
                        targetAudience: roles,
                        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined
                    })];
            case 1:
                updated = _c.sent();
                res.status(http_status_codes_1.StatusCodes.OK).json(updated);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _c.sent();
                console.error('Error updating announcement:', error_3);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update announcement.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete an announcement (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted.
 */
exports.deleteAnnouncementController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, announcementService.deleteAnnouncementService(id)];
            case 1:
                _a.sent();
                res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error deleting announcement:', error_4);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete announcement.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /announcements/{id}/broadcast:
 *   post:
 *     summary: Broadcast an announcement to target audience (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Announcement broadcasted.
 */
exports.broadcastAnnouncementController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, announcement, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, announcementService.broadcastAnnouncementService(id)];
            case 1:
                announcement = _a.sent();
                res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Announcement broadcasted successfully.', announcement: announcement });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error broadcasting announcement:', error_5);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error_5.message || 'Failed to broadcast announcement.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
