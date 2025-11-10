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
exports.getOverviewDataController = exports.getVendorUserByIdController = exports.setVendorAvailabilityController = exports.approveVendor = exports.publishVendor = exports.getIncompleteSetups = exports.getVendorsByUserId = exports.deleteVendor = exports.updateVendor = exports.getAllVendors = exports.getVendorById = exports.createVendor = void 0;
var vendorService = require("../services/vendor.service");
/**
 * @swagger
 * /vendors:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new vendor profile linked to the authenticated user. Default opening hours from 9:00 to 18:00 are created automatically for all days of the week.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorPayload'
 *     responses:
 *       201:
 *         description: The created vendor with default opening hours.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorWithRelations'
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       enum: [customer, vendor, store_admin, store_shopper, delivery_person, admin]
 *     Days:
 *       type: string
 *       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         mobileNumber: { type: string }
 *         mobileVerified: { type: boolean }
 *         active: { type: boolean }
 *         language: { type: string, nullable: true }
 *         stripeCustomerId: { type: string, nullable: true }
 *         referralCode: { type: string, nullable: true }
 *         role: { $ref: '#/components/schemas/Role' }
 *         vendorId: { type: string, format: uuid, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     Vendor:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         name: { type: string }
 *         email: { type: string, format: email, nullable: true }
 *         tagline: { type: string, nullable: true }
 *         details: { type: string, nullable: true }
 *         image: { type: string, format: uri, nullable: true }
 *         address: { type: string, nullable: true }
 *         longitude: { type: number, format: float, nullable: true }
 *         latitude: { type: number, format: float, nullable: true }
 *         timezone: { type: string, nullable: true, example: "America/New_York" }
 *         isVerified: { type: boolean }
 *         isPublished: { type: boolean }
 *         availableForShopping: { type: boolean }
 *         meta: { type: object, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorOpeningHours:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         vendorId: { type: string, format: uuid }
 *         day: { $ref: '#/components/schemas/Days' }
 *         open: { type: string, format: "HH:mm", nullable: true, example: "09:00" }
 *         close: { type: string, format: "HH:mm", nullable: true, example: "18:00" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Vendor'
 *         - type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             openingHours:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorOpeningHours'
 *     VendorWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorWithRelations'
 *         - type: object
 *           properties:
 *             rating:
 *               type: object
 *               properties:
 *                 average: { type: number, format: float }
 *                 count: { type: integer }
 *             productCount:
 *               type: integer
 *               description: "The total number of products this vendor has."
 *             distance:
 *               type: number
 *               format: float
 *               description: "Distance to the vendor from the user's location in kilometers."
 *               nullable: true
 *             documentCount:
 *               type: integer
 *               description: "The total number of documents this vendor has uploaded."
 *     VendorListItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Vendor'
 *         - type: object
 *           properties:
 *             distance:
 *               type: number
 *               format: float
 *               description: "Distance to the vendor from the user's location in kilometers."
 *               nullable: true
 *             rating:
 *               type: object
 *               properties:
 *                 average: { type: number, format: float }
 *                 count: { type: integer }
 *             cartItemCount:
 *               type: integer
 *               description: "Number of items in the user's cart for this vendor. Only present if user is authenticated."
 *     PaginatedVendors:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         totalPages: { type: integer }
 *         pageSize: { type: integer }
 *         totalCount: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VendorListItem'
 *     CreateVendorPayload:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, example: "John's Groceries" }
 *         email: { type: string, format: email, nullable: true, example: "contact@johnsgroceries.com" }
 *         tagline: { type: string, nullable: true, example: "Fresh and Local" }
 *         details: { type: string, nullable: true, example: "Your one-stop shop for fresh produce and daily essentials." }
 *         image: { type: string, format: uri, nullable: true }
 *         address: { type: string, nullable: true, example: "123 Main St, Anytown, USA" }
 *         longitude: { type: number, format: float, nullable: true, example: -73.935242 }
 *         latitude: { type: number, format: float, nullable: true, example: 40.730610 }
 *         meta: { type: object, nullable: true }
 *     UpdateVendorPayload:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         tagline: { type: string }
 *         details: { type: string }
 *         image: { type: string, format: uri }
 *         address: { type: string }
 *         longitude: { type: number, format: float }
 *         latitude: { type: number, format: float }
 *         isVerified: { type: boolean }
 *         availableForShopping: { type: boolean }
 *         meta: { type: object }
 */
exports.createVendor = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, vendor, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                payload = req.body;
                // Sanitize image data: remove data URI prefix if it exists.
                if (payload.image && payload.image.startsWith('data:')) {
                    payload.image = payload.image.split(',')[1];
                }
                return [4 /*yield*/, vendorService.createVendor(__assign(__assign({}, payload), { userId: req.userId }))];
            case 1:
                vendor = _a.sent();
                res.status(201).json(vendor);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error creating vendor:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     summary: Get a vendor by its ID
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to retrieve.
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude to calculate distance to the vendor.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude to calculate distance to the vendor.
 *     responses:
 *       200:
 *         description: The requested vendor with detailed information including user, opening hours, rating, product/document counts, and distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorWithDetails'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
exports.getVendorById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, latitude, longitude, vendor, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, latitude = _a.latitude, longitude = _a.longitude;
                return [4 /*yield*/, vendorService.getVendorById(req.params.id, latitude, longitude)];
            case 1:
                vendor = _b.sent();
                if (!vendor) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor not found' })];
                }
                res.status(200).json(vendor);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error getting vendor by ID:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/* export const getVendorsByProximity = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const customerLatitude = parseFloat(latitude as string);
    const customerLongitude = parseFloat(longitude as string);

    if (isNaN(customerLatitude) || isNaN(customerLongitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude format.' });
    }

    const nearbyVendors = await vendorService.getVendorsByProximity(
      customerLatitude,
      customerLongitude
    );

    res.json(nearbyVendors);
  } catch (error) {
    console.error('Error listing vendors by proximity:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}; */
/**
 * @swagger
 * /vendors:
 *   get:
 *     summary: Get a paginated list of vendors
 *     tags: [Vendor]
 *     description: Retrieves a list of vendors. Can be filtered by name and sorted by proximity if latitude and longitude are provided. If the user is authenticated, it also returns the number of items in their cart for each vendor.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter vendors by name (case-insensitive search).
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude to sort vendors by distance.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude to sort vendors by distance.
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter vendors by the user who owns them.
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter vendors by their verification status.
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter vendors by their published status.
 *       - in: query
 *         name: createdAtStart
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter vendors created on or after this date (ISO 8601 format).
 *       - in: query
 *         name: createdAtEnd
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter vendors created on or before this date (ISO 8601 format).
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
 *         description: A paginated list of vendors.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedVendors'
 *       500:
 *         description: Internal server error.
 */
exports.getAllVendors = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, latitude, longitude, queryUserId, isVerified, isPublished, createdAtStart, createdAtEnd, authUserId, page, take, parseBoolean, filters, vendors, error_3;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = req.query, name = _a.name, latitude = _a.latitude, longitude = _a.longitude, queryUserId = _a.userId, isVerified = _a.isVerified, isPublished = _a.isPublished, createdAtStart = _a.createdAtStart, createdAtEnd = _a.createdAtEnd;
                authUserId = req.userId;
                page = ((_c = (_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.page) === null || _c === void 0 ? void 0 : _c.toString()) || "1";
                take = ((_e = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.size) === null || _e === void 0 ? void 0 : _e.toString()) || "20";
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 4]);
                parseBoolean = function (value) {
                    if (value === 'true')
                        return true;
                    if (value === 'false')
                        return false;
                    return undefined;
                };
                filters = {
                    name: name, latitude: latitude, longitude: longitude,
                    userId: queryUserId || authUserId,
                    isVerified: parseBoolean(isVerified),
                    isPublished: parseBoolean(isPublished),
                    createdAtStart: createdAtStart,
                    createdAtEnd: createdAtEnd
                };
                return [4 /*yield*/, vendorService.getAllVendors(filters, { page: page, take: take })];
            case 2:
                vendors = _f.sent();
                res.status(200).json(vendors);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _f.sent();
                console.error('Error getting all vendors:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/{id}:
 *   patch:
 *     summary: Update a vendor's details
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendorPayload'
 *     responses:
 *       200:
 *         description: The updated vendor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorWithRelations'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateVendor = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, payload, vendor, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                payload = __assign({}, req.body);
                // When using formData, nested objects, booleans, and numbers might be sent as strings.
                // We need to parse them back before sending to the service layer.
                if (payload.meta && typeof payload.meta === 'string') {
                    payload.meta = JSON.parse(payload.meta);
                }
                // Sanitize image data: remove data URI prefix if it exists.
                if (payload.image && payload.image.startsWith('data:')) {
                    payload.image = payload.image.split(',')[1];
                }
                if (payload.longitude && typeof payload.longitude === 'string') {
                    payload.longitude = parseFloat(payload.longitude);
                }
                if (payload.latitude && typeof payload.latitude === 'string') {
                    payload.latitude = parseFloat(payload.latitude);
                }
                return [4 /*yield*/, vendorService.updateVendor(id, payload)];
            case 1:
                vendor = _a.sent();
                res.status(200).json(vendor);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error updating vendor:', error_4);
                if ((error_4 === null || error_4 === void 0 ? void 0 : error_4.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor not found' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/{id}:
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to delete.
 *     responses:
 *       200:
 *         description: The deleted vendor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorWithRelations'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteVendor = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendor, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vendorService.deleteVendor(req.params.id)];
            case 1:
                vendor = _a.sent();
                res.status(200).json(vendor);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error deleting vendor:', error_5);
                if ((error_5 === null || error_5 === void 0 ? void 0 : error_5.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor not found' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/getvendorsby/userId:
 *   get:
 *     summary: Get all vendors for the authenticated user
 *     tags: [Vendor]
 *     description: Retrieves a list of all vendors associated with the currently authenticated user.
 *     responses:
 *       200:
 *         description: A list of the user's vendors.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorListItem'
 *       500:
 *         description: Internal server error.
 */
exports.getVendorsByUserId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendors, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.userId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized' })];
                }
                return [4 /*yield*/, vendorService.getVendorsByUserId(req.userId)];
            case 1:
                vendors = _a.sent();
                res.status(200).json(vendors);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error getting vendors by userId:', error_6);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/incomplete-setups:
 *   get:
 *     summary: Find vendors with incomplete setup
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Retrieves a list of vendors for the authenticated user that have not completed their setup.
 *       A setup is considered incomplete if the vendor has either not added any products OR has uploaded fewer than two documents.
 *     responses:
 *       200:
 *         description: A list of vendors with incomplete setups.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incompleteVendors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vendor'
 *       500:
 *         description: Internal server error.
 */
exports.getIncompleteSetups = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, vendors, documentCounts, documentCountMap_1, incompleteVendors, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.userId;
                return [4 /*yield*/, vendorService.getVendorsByUserIdWithProductCount(userId)];
            case 1:
                vendors = _a.sent();
                if (vendors.length === 0) {
                    return [2 /*return*/, res.status(200).json({ incompleteVendors: [] })];
                }
                return [4 /*yield*/, vendorService.getVendorDocumentCounts(vendors.map(function (v) { return v.id; }))];
            case 2:
                documentCounts = _a.sent();
                documentCountMap_1 = new Map(documentCounts.map(function (item) { return [item.referenceId, item._count._all]; }));
                incompleteVendors = vendors.filter(function (vendor) {
                    var productCount = vendor._count.vendorProducts;
                    var docCount = documentCountMap_1.get(vendor.id) || 0;
                    return productCount === 0 || docCount < 2;
                });
                res.status(200).json({ incompleteVendors: incompleteVendors });
                return [3 /*break*/, 4];
            case 3:
                error_7 = _a.sent();
                console.error('Failed to get incomplete vendor setups:', error_7);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/{id}/publish:
 *   patch:
 *     summary: Publish a vendor's store
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Marks a vendor's store as published by setting `isPublished` to true, making it visible to customers.
 *       Only the user who owns the vendor can perform this action.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to publish.
 *     responses:
 *       200:
 *         description: The successfully published vendor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       403:
 *         description: Forbidden. User does not own this vendor.
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
exports.publishVendor = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, vendor, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                userId = req.userId;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, vendorService.publishVendor(id, userId)];
            case 2:
                vendor = _a.sent();
                res.status(200).json(vendor);
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                console.error('Error publishing vendor:', error_8);
                if (error_8.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_8.message })];
                }
                if (error_8.message.includes('Forbidden')) {
                    return [2 /*return*/, res.status(403).json({ error: error_8.message })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/{id}/approve:
 *   patch:
 *     summary: Approve a vendor's store (Admin)
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Marks a vendor's store as verified by setting `isVerified` to true.
 *       This is intended to be an admin-only action.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to approve.
 *     responses:
 *       200:
 *         description: The successfully approved vendor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
exports.approveVendor = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, vendor, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, vendorService.approveVendor(id)];
            case 1:
                vendor = _a.sent();
                res.status(200).json(vendor);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                res.status(error_9.message.includes('not found') ? 404 : 500).json({ error: error_9.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/{id}/availability:
 *   patch:
 *     summary: Set a vendor's shopping availability
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Marks a vendor's store as available or unavailable for shopping by setting `availableForShopping`.
 *       Only the user who owns the vendor can perform this action.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [available]
 *             properties:
 *               available:
 *                 type: boolean
 *                 description: Set to `true` to make the store available for shopping, `false` to make it unavailable.
 *     responses:
 *       200:
 *         description: The updated vendor with the new availability status.
 *       403:
 *         description: Forbidden. User does not own this vendor.
 *       404:
 *         description: Vendor not found.
 */
exports.setVendorAvailabilityController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, available, vendor, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                userId = req.userId;
                available = req.body.available;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, vendorService.setVendorAvailability(id, userId, available)];
            case 2:
                vendor = _a.sent();
                res.status(200).json(vendor);
                return [3 /*break*/, 4];
            case 3:
                error_10 = _a.sent();
                if (error_10.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_10.message })];
                }
                if (error_10.message.includes('Forbidden')) {
                    return [2 /*return*/, res.status(403).json({ error: error_10.message })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/users/{userId}:
 *   get:
 *     summary: Get a single vendor user by their User ID (Admin)
 *     tags: [Vendor, Users]
 *     description: Retrieves the details of a specific user who has the 'vendor' role. Intended for admin use.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor user to retrieve.
 *     responses:
 *       200:
 *         description: The requested vendor user's details.
 *       404:
 *         description: Vendor user not found or user is not a vendor.
 *       500:
 *         description: Internal server error.
 */
exports.getVendorUserByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, vendorUser, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                return [4 /*yield*/, vendorService.getVendorUserByIdService(userId)];
            case 1:
                vendorUser = _a.sent();
                res.status(200).json(vendorUser);
                return [3 /*break*/, 3];
            case 2:
                error_11 = _a.sent();
                res.status(error_11.message.includes('not found') ? 404 : 500).json({ error: error_11.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /vendors/overview:
 *   get:
 *     summary: Get platform overview data (Admin)
 *     tags: [Vendor, Admin]
 *     description: Retrieves aggregate data about the platform, such as the total number of vendor users, stores, and staff members. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An object containing the overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVendorUsers: { type: integer }
 *                 totalStores: { type: integer }
 *                 totalStaff: { type: integer }
 *       500:
 *         description: Internal server error.
 */
exports.getOverviewDataController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overviewData, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vendorService.getOverviewDataService()];
            case 1:
                overviewData = _a.sent();
                res.status(200).json(overviewData);
                return [3 /*break*/, 3];
            case 2:
                error_12 = _a.sent();
                console.error('Error getting overview data:', error_12);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
