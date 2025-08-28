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
exports.getVendorsByUserId = exports.deleteVendor = exports.updateVendor = exports.getAllVendors = exports.getVendorById = exports.createVendor = void 0;
// services/vendor.service.ts
var vendorModel = require("../models/vendor.model");
var toRadians = function (degrees) {
    return degrees * (Math.PI / 180);
};
var calculateDistance = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the Earth in km
    var dLat = toRadians(lat2 - lat1);
    var dLon = toRadians(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.createVendor = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, vendorModel.createVendor(payload)];
    });
}); };
exports.getVendorById = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, vendorModel.getVendorById(id)];
    });
}); };
exports.getAllVendors = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorsResult, processedVendors, customerLatitude_1, customerLongitude_1, vendorsWithDistance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendorModel.getAllVendors(filters, pagination)];
            case 1:
                vendorsResult = _a.sent();
                processedVendors = vendorsResult.data.map(function (vendor) {
                    var _a, _b, _c;
                    var cartItemCount = ((_c = (_b = (_a = vendor.carts) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b._count) === null || _c === void 0 ? void 0 : _c.items) || 0;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    var carts = vendor.carts, vendorWithoutCarts = __rest(vendor, ["carts"]);
                    return __assign(__assign({}, vendorWithoutCarts), { cartItemCount: cartItemCount });
                });
                if (filters.latitude && filters.longitude) {
                    customerLatitude_1 = parseFloat(filters.latitude);
                    customerLongitude_1 = parseFloat(filters.longitude);
                    if (!isNaN(customerLatitude_1) && !isNaN(customerLongitude_1)) {
                        vendorsWithDistance = processedVendors.map(function (vendor) {
                            var distance = calculateDistance(customerLatitude_1, customerLongitude_1, vendor.latitude, vendor.longitude);
                            return __assign(__assign({}, vendor), { distance: distance });
                        });
                        // Sort vendors by distance in ascending order
                        vendorsWithDistance.sort(function (a, b) { return a.distance - b.distance; });
                        return [2 /*return*/, __assign(__assign({}, vendorsResult), { data: vendorsWithDistance })];
                    }
                }
                return [2 /*return*/, __assign(__assign({}, vendorsResult), { data: processedVendors })];
        }
    });
}); };
exports.updateVendor = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, vendorModel.updateVendor(id, payload)];
    });
}); };
exports.deleteVendor = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, vendorModel.deleteVendor(id)];
    });
}); };
exports.getVendorsByUserId = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, vendorModel.getVendorsByUserId(userId)];
    });
}); };
