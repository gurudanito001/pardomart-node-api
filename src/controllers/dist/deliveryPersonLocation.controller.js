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
exports.getPathController = exports.addLocationController = void 0;
var deliveryPersonLocationService = require("../services/deliveryPersonLocation.service");
/**
 * @swagger
 * /orders/{orderId}/delivery-location:
 *   post:
 *     summary: Add a location point for a delivery person
 *     tags: [Order, Delivery]
 *     security:
 *       - bearerAuth: []
 *     description: Logs the current geographic coordinates of the delivery person for a specific order. This should be called periodically by the delivery person's application. Only the assigned delivery person for the order can post a location.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order being delivered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the delivery person.
 *                 example: 34.052235
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the delivery person.
 *                 example: -118.243683
 *     responses:
 *       201:
 *         description: Location successfully logged.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryPersonLocation'
 *       403:
 *         description: Forbidden. User is not the assigned delivery person for this order.
 *       404:
 *         description: Order not found.
 */
exports.addLocationController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, _a, latitude, longitude, deliveryPersonId, location, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                _a = req.body, latitude = _a.latitude, longitude = _a.longitude;
                deliveryPersonId = req.userId;
                return [4 /*yield*/, deliveryPersonLocationService.addDeliveryPersonLocation(orderId, deliveryPersonId, latitude, longitude)];
            case 1:
                location = _b.sent();
                res.status(201).json(location);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res.status(error_1.statusCode || 500).json({ error: error_1.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /orders/{orderId}/delivery-path:
 *   get:
 *     summary: Get the delivery path for an order
 *     tags: [Order, Delivery]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves the historical path of the delivery person for a specific order. This can be used to display the route on a map. Accessible by the customer who placed the order, the assigned delivery person, or an admin.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to retrieve the path for.
 *     responses:
 *       200:
 *         description: An array of location points, sorted by time. An empty array is returned if no path data exists yet.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeliveryPersonLocation'
 *       403:
 *         description: Forbidden. User is not authorized to view this path.
 *       404:
 *         description: Order not found.
 */
exports.getPathController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, userId, userRole, path, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                userId = req.userId, userRole = req.userRole;
                return [4 /*yield*/, deliveryPersonLocationService.getDeliveryPath(orderId, userId, userRole)];
            case 1:
                path = _a.sent();
                res.status(200).json(path);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(error_2.statusCode || 500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
