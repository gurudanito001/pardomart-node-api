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
exports.deleteAdController = exports.updateAdController = exports.getAdByIdController = exports.listAdsController = exports.createAdController = void 0;
var adService = require("../services/ad.service");
var ad_service_1 = require("../services/ad.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Advertisement management for stores
 */
/**
 * @swagger
 * /ads:
 *   post:
 *     summary: Create a new ad (Admin)
 *     tags: [Ads, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new advertisement for a store. Requires admin privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdPayload'
 *     responses:
 *       201:
 *         description: The created ad.
 *         content: { "application/json": { "schema": { "$ref": "#/components/schemas/Ad" } } }
 *       400: { description: "Bad request (e.g., missing fields or image)." }
 */
exports.createAdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, ad, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                payload = __assign(__assign({}, req.body), { imageFile: req.file });
                // Convert string booleans/numbers from form-data
                if (payload.isActive)
                    payload.isActive = payload.isActive === 'true';
                return [4 /*yield*/, adService.createAdService(payload)];
            case 1:
                ad = _a.sent();
                res.status(201).json(ad);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1 instanceof ad_service_1.AdError) {
                    return [2 /*return*/, res.status(error_1.statusCode).json({ error: error_1.message })];
                }
                console.error('Error creating ad:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ads:
 *   get:
 *     summary: Get a list of ads
 *     tags: [Ads]
 *     description: Retrieves a list of ads. Publicly accessible to get active ads. Admins can filter by status.
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *         description: "Filter by active status. If true, only returns currently running ads."
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: "Filter ads for a specific store."
 *     responses:
 *       200:
 *         description: A list of ads.
 *         content: { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Ad" } } } }
 */
exports.listAdsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, isActive, vendorId, filters, ads, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, isActive = _a.isActive, vendorId = _a.vendorId;
                filters = {};
                if (isActive !== undefined)
                    filters.isActive = isActive === 'true';
                if (vendorId)
                    filters.vendorId = vendorId;
                return [4 /*yield*/, adService.listAdsService(filters)];
            case 1:
                ads = _b.sent();
                res.status(200).json(ads);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error listing ads:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ads/{id}:
 *   get:
 *     summary: Get a single ad by ID
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The requested ad.
 *         content: { "application/json": { "schema": { "$ref": "#/components/schemas/Ad" } } }
 *       404: { description: "Ad not found." }
 */
exports.getAdByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ad, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, adService.getAdByIdService(req.params.id)];
            case 1:
                ad = _a.sent();
                if (!ad) {
                    return [2 /*return*/, res.status(404).json({ error: 'Ad not found.' })];
                }
                res.status(200).json(ad);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error getting ad by ID:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ads/{id}:
 *   patch:
 *     summary: Update an ad (Admin)
 *     tags: [Ads, Admin]
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
 *           schema: { $ref: '#/components/schemas/UpdateAdPayload' }
 *     responses:
 *       200: { description: "The updated ad." }
 *       404: { description: "Ad not found." }
 */
exports.updateAdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, isActive, endDate, restOfBody, payload, ad, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, isActive = _a.isActive, endDate = _a.endDate, restOfBody = __rest(_a, ["isActive", "endDate"]);
                payload = __assign(__assign({}, restOfBody), { imageFile: req.file });
                if (isActive !== undefined) {
                    payload.isActive = isActive === 'true';
                }
                if (endDate !== undefined) {
                    payload.endDate = endDate === 'null' ? null : endDate;
                }
                return [4 /*yield*/, adService.updateAdService(req.params.id, payload)];
            case 1:
                ad = _b.sent();
                res.status(200).json(ad);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                if (error_4 instanceof ad_service_1.AdError)
                    return [2 /*return*/, res.status(error_4.statusCode).json({ error: error_4.message })];
                if (error_4 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_4.code === 'P2025')
                    return [2 /*return*/, res.status(404).json({ error: 'Ad not found.' })];
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ads/{id}:
 *   delete:
 *     summary: Delete an ad (Admin)
 *     tags: [Ads, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: "Ad deleted successfully." }
 *       404: { description: "Ad not found." }
 */
exports.deleteAdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, adService.deleteAdService(req.params.id)];
            case 1:
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                if (error_5 instanceof ad_service_1.AdError)
                    return [2 /*return*/, res.status(error_5.statusCode).json({ error: error_5.message })];
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
