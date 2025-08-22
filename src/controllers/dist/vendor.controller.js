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
exports.getVendorsByUserId = exports.deleteVendor = exports.updateVendor = exports.getAllVendors = exports.getVendorById = exports.createVendor = void 0;
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
 */
exports.createVendor = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendor, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vendorService.createVendor(__assign(__assign({}, req.body), { userId: req === null || req === void 0 ? void 0 : req.userId }))];
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
 *     responses:
 *       200:
 *         description: The requested vendor with its associated user and opening hours.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorWithRelations'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
exports.getVendorById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendor, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vendorService.getVendorById(req.params.id)];
            case 1:
                vendor = _a.sent();
                if (!vendor) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor not found' })];
                }
                res.status(200).json(vendor);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
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
 *     description: Retrieves a list of vendors. Can be filtered by name and sorted by proximity if latitude and longitude are provided.
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
    var _a, name, latitude, longitude, page, take, vendors, error_3;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = req.query, name = _a.name, latitude = _a.latitude, longitude = _a.longitude;
                page = ((_c = (_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.page) === null || _c === void 0 ? void 0 : _c.toString()) || "1";
                take = ((_e = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.size) === null || _e === void 0 ? void 0 : _e.toString()) || "20";
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 4]);
                return [4 /*yield*/, vendorService.getAllVendors({ name: name, latitude: latitude, longitude: longitude }, { page: page, take: take })];
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
 *               $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateVendor = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, vendor, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, vendorService.updateVendor(id, req.body)];
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
 *               $ref: '#/components/schemas/Vendor'
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
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a list of all vendors associated with the currently authenticated user.
 *     responses:
 *       200:
 *         description: A list of the user's vendors.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vendor'
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
