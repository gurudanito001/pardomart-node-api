"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.deleteAdService = exports.updateAdService = exports.getAdByIdService = exports.listAdsService = exports.createAdService = exports.AdError = void 0;
var adModel = require("../models/ad.model");
var media_service_1 = require("./media.service");
var AdError = /** @class */ (function (_super) {
    __extends(AdError, _super);
    function AdError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = 'AdError';
        _this.statusCode = statusCode;
        return _this;
    }
    return AdError;
}(Error));
exports.AdError = AdError;
/**
 * Creates a new ad, handling image upload.
 * @param payload - The ad data and image file.
 * @returns The created ad.
 */
exports.createAdService = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var imageFile, adData, uploadResult, finalPayload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                imageFile = payload.imageFile, adData = __rest(payload, ["imageFile"]);
                if (!imageFile) {
                    throw new AdError('An image file is required to create an ad.');
                }
                return [4 /*yield*/, media_service_1.uploadMedia(imageFile, adData.vendorId, 'ad_image')];
            case 1:
                uploadResult = _a.sent();
                finalPayload = __assign(__assign({}, adData), { imageUrl: uploadResult.cloudinaryResult.secure_url });
                return [2 /*return*/, adModel.createAd(finalPayload)];
        }
    });
}); };
/**
 * Retrieves a list of ads based on filters.
 * @param filters - The filtering criteria.
 * @returns An array of ad objects.
 */
exports.listAdsService = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, adModel.listAds(filters)];
    });
}); };
/**
 * Retrieves an ad by its ID.
 * @param id - The ID of the ad.
 * @returns The ad object or null.
 */
exports.getAdByIdService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, adModel.getAdById(id)];
    });
}); };
/**
 * Updates an ad, handling optional new image upload.
 * @param id - The ID of the ad to update.
 * @param payload - The data to update.
 * @returns The updated ad.
 */
exports.updateAdService = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    var imageFile, updateData, ad, finalUpdateData, uploadResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                imageFile = payload.imageFile, updateData = __rest(payload, ["imageFile"]);
                return [4 /*yield*/, adModel.getAdById(id)];
            case 1:
                ad = _a.sent();
                if (!ad) {
                    throw new AdError('Ad not found.', 404);
                }
                finalUpdateData = __assign({}, updateData);
                if (!imageFile) return [3 /*break*/, 3];
                return [4 /*yield*/, media_service_1.uploadMedia(imageFile, ad.vendorId, 'ad_image')];
            case 2:
                uploadResult = _a.sent();
                finalUpdateData = __assign(__assign({}, finalUpdateData), { imageUrl: uploadResult.cloudinaryResult.secure_url });
                _a.label = 3;
            case 3: return [2 /*return*/, adModel.updateAd(id, finalUpdateData)];
        }
    });
}); };
/**
 * Deletes an ad.
 * @param id - The ID of the ad to delete.
 * @returns The deleted ad.
 */
exports.deleteAdService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    var ad;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, adModel.getAdById(id)];
            case 1:
                ad = _a.sent();
                if (!ad) {
                    throw new AdError('Ad not found.', 404);
                }
                // Note: Deleting the record in the DB is enough.
                // We don't need to delete the image from Cloudinary unless required for storage management.
                return [2 /*return*/, adModel.deleteAd(id)];
        }
    });
}); };
