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
exports.getAllVendorOpeningHours = exports.updateVendorOpeningHours = void 0;
var vendorOpeningHoursService = require("../services/vendorOpeningHours.service");
var client_1 = require("@prisma/client"); // Import Prisma
/**
 * @swagger
 * /openingHours:
 *   patch:
 *     summary: Update opening hours for a specific day
 *     tags: [VendorOpeningHours]
 *     security:
 *       - bearerAuth: []
 *     description: Finds and updates the opening and closing times for a given vendor on a specific day of the week.
 *     requestBody:
 *       required: true
 *       content: { "application/json": { "schema": { "$ref": "#/components/schemas/UpdateOpeningHoursPayload" } } }
 *     responses:
 *       200:
 *         description: The updated opening hours record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorOpeningHours'
 *       400:
 *         description: Bad request, vendorId and day are required.
 *       404:
 *         description: Opening hours record not found for the specified vendor and day.
 *       409:
 *         description: Conflict - this should not typically occur on an update.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     Days:
 *       type: string
 *       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
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
 *     UpdateOpeningHoursPayload:
 *       type: object
 *       required: [vendorId, day]
 *       properties:
 *         vendorId:
 *           type: string
 *           format: uuid
 *           description: The ID of the vendor whose opening hours are being updated.
 *         day:
 *           $ref: '#/components/schemas/Days'
 *         open:
 *           type: string
 *           format: "HH:mm"
 *           nullable: true
 *           description: "The opening time in 24-hour format (e.g., '09:00'). Set to null to mark as closed."
 *           example: "09:00"
 *         close:
 *           type: string
 *           format: "HH:mm"
 *           nullable: true
 *           description: "The closing time in 24-hour format (e.g., '18:00'). Set to null to mark as closed."
 *           example: "18:00"
 */
exports.updateVendorOpeningHours = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, vendorId, day, open, close, existingOpeningHours, updatedOpeningHours, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, vendorId = _a.vendorId, day = _a.day, open = _a.open, close = _a.close;
                if (!vendorId || !day) {
                    return [2 /*return*/, res.status(400).json({ error: 'Vendor ID and Day are required for updating' })];
                }
                return [4 /*yield*/, vendorOpeningHoursService.getVendorOpeningHoursByVendorIdAndDay(vendorId, day)];
            case 1:
                existingOpeningHours = _b.sent();
                if (!existingOpeningHours) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor opening hours not found for the specified vendor and day' })];
                }
                return [4 /*yield*/, vendorOpeningHoursService.updateVendorOpeningHours({
                        id: existingOpeningHours.id,
                        open: open,
                        close: close
                    })];
            case 2:
                updatedOpeningHours = _b.sent();
                res.json(updatedOpeningHours);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                if (error_1 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_1.code === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'Vendor opening hours for this day already exists' })];
                }
                console.error('Error updating vendor opening hours:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /openingHours:
 *   get:
 *     summary: Get all opening hours for a specific vendor
 *     tags: [VendorOpeningHours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to retrieve opening hours for.
 *     responses:
 *       200:
 *         description: A list of the vendor's opening hours.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorOpeningHours'
 *       500:
 *         description: Internal server error.
 */
exports.getAllVendorOpeningHours = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorId, vendorOpeningHours, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                vendorId = req.query.vendorId;
                return [4 /*yield*/, vendorOpeningHoursService.getAllVendorOpeningHours(vendorId)];
            case 1:
                vendorOpeningHours = _a.sent();
                res.json(vendorOpeningHours);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting all vendor opening hours:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/* export const getVendorOpeningHoursById = async (req: Request, res: Response) => {
  try {
    const vendorOpeningHours = await vendorOpeningHoursService.getVendorOpeningHoursById(req.params.id);
    if (!vendorOpeningHours) {
      return res.status(404).json({ error: 'Vendor opening hours not found' });
    }
    res.json(vendorOpeningHours);
  } catch (error) {
    console.error('Error getting vendor opening hours by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; */
/* export const updateVendorOpeningHours = async (req: Request, res: Response) => {
  try {
    const vendorOpeningHours = await vendorOpeningHoursService.updateVendorOpeningHours({ id: req.params.id, ...req.body });
    res.json(vendorOpeningHours);
  } catch (error) {
    console.error('Error updating vendor opening hours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; */
/* export const deleteVendorOpeningHours = async (req: Request, res: Response) => {
  try {
    const vendorOpeningHours = await vendorOpeningHoursService.deleteVendorOpeningHours(req.params.id);
    res.json(vendorOpeningHours);
  } catch (error) {
    console.error('Error deleting vendor opening hours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; */ 
