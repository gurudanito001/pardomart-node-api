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
exports.calculateFeesController = exports.getCurrentFeesController = exports.deactivateFeeController = exports.deleteFeeController = exports.updateFeeController = exports.createFeeController = void 0;
var fee_service_1 = require("../services/fee.service"); // Adjust the path to your fee service file
// --- Fee Controllers ---
/**
 * @swagger
 * /fees:
 *   post:
 *     summary: Create a new fee
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeePayload'
 *     responses:
 *       201:
 *         description: The created fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Bad request, invalid payload.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     DeliveryMethod:
 *       type: string
 *       enum: [delivery_person, customer_pickup]
 *     FeeType:
 *       type: string
 *       enum: [delivery, service, shopping]
 *     FeeCalculationMethod:
 *       type: string
 *       enum: [flat, percentage, per_unit, per_distance]
 *     Fee:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         type: { $ref: '#/components/schemas/FeeType' }
 *         amount: { type: number, format: float }
 *         method: { $ref: '#/components/schemas/FeeCalculationMethod' }
 *         unit: { type: string, nullable: true, description: "e.g., 'km' for per_distance" }
 *         minThreshold: { type: number, format: float, nullable: true }
 *         maxThreshold: { type: number, format: float, nullable: true }
 *         thresholdAppliesTo: { type: string, nullable: true, description: "e.g., 'order_subtotal'" }
 *         isActive: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateFeePayload:
 *       type: object
 *       required: [type, amount, method, isActive]
 *       properties:
 *         type: { $ref: '#/components/schemas/FeeType' }
 *         amount: { type: number, format: float }
 *         method: { $ref: '#/components/schemas/FeeCalculationMethod' }
 *         unit: { type: string, nullable: true }
 *         minThreshold: { type: number, format: float, nullable: true }
 *         maxThreshold: { type: number, format: float, nullable: true }
 *         thresholdAppliesTo: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *     UpdateFeePayload:
 *       type: object
 *       properties:
 *         amount: { type: number, format: float }
 *         method: { $ref: '#/components/schemas/FeeCalculationMethod' }
 *         unit: { type: string, nullable: true }
 *         minThreshold: { type: number, format: float, nullable: true }
 *         maxThreshold: { type: number, format: float, nullable: true }
 *         thresholdAppliesTo: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *     CalculateFeesPayload:
 *       type: object
 *       required: [orderItems, vendorId]
 *       properties:
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             required: [vendorProductId, quantity]
 *             properties:
 *               vendorProductId: { type: string, format: uuid }
 *               quantity: { type: integer, minimum: 1 }
 *         vendorId: { type: string, format: uuid }
 *         deliveryAddressId: { type: string, format: uuid, nullable: true, description: "Required if deliveryType is not 'customer_pickup'." }
 *         deliveryType: { $ref: '#/components/schemas/DeliveryMethod', description: "Defaults to delivery if not provided." }
 *     CalculateFeesResponse:
 *       type: object
 *       properties:
 *         subtotal: { type: number, format: float }
 *         shoppingFee: { type: number, format: float }
 *         deliveryFee: { type: number, format: float }
 *         serviceFee: { type: number, format: float }
 *         totalEstimatedCost: { type: number, format: float }
 */
exports.createFeeController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, newFee, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                payload = req.body;
                return [4 /*yield*/, fee_service_1.createFee(payload)];
            case 1:
                newFee = _a.sent();
                res.status(201).json(newFee);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error in createFeeController:', error_1);
                res.status(500).json({ error: error_1.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /fees/{id}:
 *   patch:
 *     summary: Update an existing fee
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the fee to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFeePayload'
 *     responses:
 *       200:
 *         description: The updated fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Bad request, invalid payload.
 *       404:
 *         description: Fee not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateFeeController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, payload, updatedFee, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                payload = req.body;
                return [4 /*yield*/, fee_service_1.updateFee(id, payload)];
            case 1:
                updatedFee = _a.sent();
                res.status(200).json(updatedFee);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error in updateFeeController:', error_2);
                if (error_2.message === 'Fee not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_2.message })];
                }
                res.status(500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /fees/{id}:
 *   delete:
 *     summary: Delete a fee by its ID
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the fee to delete.
 *     responses:
 *       200:
 *         description: The deleted fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       404:
 *         description: Fee not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteFeeController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, deletedFee, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, fee_service_1.deleteFee(id)];
            case 1:
                deletedFee = _a.sent();
                res.status(200).json(deletedFee);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error in deleteFeeController:', error_3);
                if (error_3.message === 'Fee not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_3.message })];
                }
                res.status(500).json({ error: error_3.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /fees/deactivate/{type}:
 *   patch:
 *     summary: Deactivate the current active fee of a specific type
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [delivery, service, shopping]
 *         description: The type of fee to deactivate.
 *     responses:
 *       200:
 *         description: The deactivated fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Invalid fee type provided.
 *       404:
 *         description: No active fee of the specified type was found.
 *       500:
 *         description: Internal server error.
 */
exports.deactivateFeeController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var type, deactivatedFee, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                type = req.params.type;
                return [4 /*yield*/, fee_service_1.deactivateFee(type)];
            case 1:
                deactivatedFee = _a.sent();
                if (deactivatedFee) {
                    res.status(200).json(deactivatedFee);
                }
                else {
                    res.status(404).json({ message: "No active fee found for type: " + type });
                }
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error in deactivateFeeController:', error_4);
                res.status(500).json({ error: error_4.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /fees/current:
 *   get:
 *     summary: Get all current active fees
 *     tags: [Fee]
 *     responses:
 *       200:
 *         description: A list of all active fees.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fee'
 *       404:
 *         description: No active fees found.
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /fees/current/{type}:
 *   get:
 *     summary: Get the current active fee for a specific type
 *     tags: [Fee]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [delivery, service, shopping]
 *         description: The type of fee to retrieve.
 *     responses:
 *       200:
 *         description: The requested active fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Invalid fee type provided.
 *       404:
 *         description: No active fee of the specified type was found.
 *       500:
 *         description: Internal server error.
 */
// Controller for getting current active fees.
// GET /fees/current
// GET /fees/current/:type
exports.getCurrentFeesController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var type, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                type = req.params.type;
                result = void 0;
                if (!type) return [3 /*break*/, 2];
                return [4 /*yield*/, fee_service_1.getCurrentFees(type)];
            case 1:
                result = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, fee_service_1.getCurrentFees()];
            case 3:
                result = _a.sent();
                _a.label = 4;
            case 4:
                if (result === null || (Array.isArray(result) && result.length === 0)) {
                    res.status(404).json({ message: 'No active fees found.' });
                }
                else {
                    res.status(200).json(result);
                }
                return [3 /*break*/, 6];
            case 5:
                error_5 = _a.sent();
                console.error('Error in getCurrentFeesController:', error_5);
                res.status(500).json({ error: error_5.message || 'Internal server error' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /fees/calculate-fees:
 *   post:
 *     summary: Calculate the total estimated cost for an order
 *     tags: [Fee, Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalculateFeesPayload'
 *     responses:
 *       200:
 *         description: The calculated fees for the order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalculateFeesResponse'
 *       400:
 *         description: Bad request, invalid payload.
 *       500:
 *         description: Internal server error.
 */
exports.calculateFeesController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, orderItems, vendorId, deliveryAddressId, deliveryType, feesResult, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, orderItems = _a.orderItems, vendorId = _a.vendorId, deliveryAddressId = _a.deliveryAddressId, deliveryType = _a.deliveryType;
                return [4 /*yield*/, fee_service_1.calculateOrderFeesService({
                        orderItems: orderItems,
                        vendorId: vendorId,
                        deliveryAddressId: deliveryAddressId,
                        deliveryType: deliveryType
                    })];
            case 1:
                feesResult = _b.sent();
                res.status(200).json(feesResult);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _b.sent();
                console.error('Error in calculateFeesController:', error_6);
                res.status(500).json({ error: error_6.message || 'Internal server error during fee calculation.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
