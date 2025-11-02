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
exports.adminUpdateDeliveryPersonProfileService = exports.adminGetDeliveryHistoryService = exports.adminGetDeliveryPersonDetailsByIdService = exports.adminListAllDeliveryPersonsService = exports.getDeliveryPersonOverviewService = void 0;
var client_1 = require("@prisma/client");
var dayjs_1 = require("dayjs");
var deliveryPersonModel = require("../models/delivery-person.model");
var userModel = require("../models/user.model");
var prisma = new client_1.PrismaClient();
/**
 * (Admin) Retrieves an overview of delivery person data for the platform.
 * @param days The number of days to look back for new delivery persons. Defaults to 30.
 * @returns An object containing overview data.
 */
exports.getDeliveryPersonOverviewService = function (days) {
    if (days === void 0) { days = 30; }
    return __awaiter(void 0, void 0, void 0, function () {
        var startDate, _a, totalDeliveryPersons, newDeliveryPersons, totalDeliveries, totalReturns;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = dayjs_1["default"]().subtract(days, 'day').toDate();
                    return [4 /*yield*/, prisma.$transaction([
                            // 1. Total number of users with the 'delivery_person' role
                            prisma.user.count({
                                where: { role: client_1.Role.delivery_person }
                            }),
                            // 2. Total new delivery persons in the last X days
                            prisma.user.count({
                                where: {
                                    role: client_1.Role.delivery_person,
                                    createdAt: { gte: startDate }
                                }
                            }),
                            // 3. Total number of completed deliveries
                            prisma.order.count({
                                where: {
                                    deliveryPersonId: { not: null },
                                    orderStatus: client_1.OrderStatus.delivered
                                }
                            }),
                        ])];
                case 1:
                    _a = _b.sent(), totalDeliveryPersons = _a[0], newDeliveryPersons = _a[1], totalDeliveries = _a[2];
                    totalReturns = 0;
                    return [2 /*return*/, {
                            totalDeliveryPersons: totalDeliveryPersons,
                            newDeliveryPersons: newDeliveryPersons,
                            totalDeliveries: totalDeliveries,
                            totalReturns: totalReturns
                        }];
            }
        });
    });
};
/**
 * (Admin) Retrieves a paginated list of all delivery persons with advanced filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of delivery persons.
 */
exports.adminListAllDeliveryPersonsService = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryPersonModel.adminListAllDeliveryPersons(filters, pagination)];
    });
}); };
/**
 * (Admin) Retrieves detailed information for a single delivery person.
 * @param deliveryPersonId - The ID of the delivery person.
 * @returns A delivery person object with their stats and recent deliveries.
 */
exports.adminGetDeliveryPersonDetailsByIdService = function (deliveryPersonId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryPersonModel.adminGetDeliveryPersonDetailsById(deliveryPersonId)];
    });
}); };
/**
 * (Admin) Retrieves a paginated delivery history for a single delivery person.
 * @param deliveryPersonId - The ID of the delivery person.
 * @param pagination - The pagination options.
 * @returns A paginated list of deliveries.
 */
exports.adminGetDeliveryHistoryService = function (deliveryPersonId, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryPersonModel.adminGetDeliveryHistory(deliveryPersonId, pagination)];
    });
}); };
/**
 * (Admin) Updates a delivery person's profile.
 * This allows an admin to modify details or suspend/deactivate an account.
 * @param deliveryPersonId The ID of the delivery person to update.
 * @param payload The data to update on the user's profile.
 * @returns The updated delivery person user object.
 * @throws Error if the user is not found or is not a delivery person.
 */
exports.adminUpdateDeliveryPersonProfileService = function (deliveryPersonId, payload) { return __awaiter(void 0, void 0, Promise, function () {
    var deliveryPerson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, deliveryPersonModel.adminGetDeliveryPersonDetailsById(deliveryPersonId)];
            case 1:
                deliveryPerson = _a.sent();
                if (!deliveryPerson) {
                    throw new Error('Delivery person not found or user is not a delivery person.');
                }
                return [2 /*return*/, userModel.updateUser(deliveryPersonId, payload)];
        }
    });
}); };
