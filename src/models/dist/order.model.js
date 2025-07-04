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
exports.deleteOrder = exports.updateOrder = exports.getOrdersByUserId = exports.getOrderById = exports.createOrder = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
exports.createOrder = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var orderPayload, order;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                orderPayload = payload;
                return [4 /*yield*/, prisma.order.create({
                        data: orderPayload
                    })];
            case 1:
                order = _a.sent();
                return [2 /*return*/, order];
        }
    });
}); };
exports.getOrderById = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.order.findUnique({
                where: { id: id },
                include: {
                    orderItems: {
                        include: {
                            vendorProduct: {
                                include: {
                                    product: true
                                }
                            }
                        }
                    },
                    shopper: true,
                    deliverer: true,
                    deliveryAddress: true
                }
            })];
    });
}); };
exports.getOrdersByUserId = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.order.deleteMany()];
            case 1:
                _a.sent();
                return [2 /*return*/, prisma.order.findMany({
                        where: { userId: userId },
                        include: {
                            orderItems: {
                                include: {
                                    vendorProduct: true
                                }
                            },
                            shopper: true,
                            deliverer: true,
                            vendor: true
                        }
                    })];
        }
    });
}); };
exports.updateOrder = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.order.update({
                where: { id: id },
                data: payload
            })];
    });
}); };
exports.deleteOrder = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.order["delete"]({
                where: { id: id }
            })];
    });
}); };
