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
exports.getAllVendors = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendors, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vendorService.getAllVendors()];
            case 1:
                vendors = _a.sent();
                res.status(200).json(vendors);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error getting all vendors:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
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
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
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
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getVendorsByUserId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendors, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vendorService.getVendorsByUserId(req.params.userId)];
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
