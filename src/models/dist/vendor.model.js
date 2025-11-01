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
exports.getVendorDocumentCounts = exports.getVendorDocumentCount = exports.getVendorsByUserIdWithProductCount = exports.deleteVendor = exports.updateVendor = exports.getVendorsByUserId = exports.getFullListOfVendors = exports.getAllVendors = exports.getVendorById = exports.createVendor = void 0;
// models/vendor.model.ts
var client_1 = require("@prisma/client");
var media_service_1 = require("../services/media.service");
var prisma = new client_1.PrismaClient();
exports.createVendor = function (payload, tx) { return __awaiter(void 0, void 0, Promise, function () {
    var db, image, vendorData, vendor, openingHoursData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = tx || prisma;
                image = payload.image, vendorData = __rest(payload, ["image"]);
                return [4 /*yield*/, db.vendor.create({
                        data: __assign({}, vendorData)
                    })];
            case 1:
                vendor = _a.sent();
                openingHoursData = Object.values(client_1.Days).map(function (day) { return ({
                    vendorId: vendor.id,
                    day: day,
                    open: '09:00',
                    close: '18:00'
                }); });
                return [4 /*yield*/, db.vendorOpeningHours.createMany({
                        data: openingHoursData
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, vendor];
        }
    });
}); };
exports.getVendorById = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendor.findUnique({
                where: { id: id },
                include: {
                    user: true,
                    openingHours: true,
                    _count: {
                        select: {
                            vendorProducts: true
                        }
                    }
                }
            })];
    });
}); };
exports.getAllVendors = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var skip, takeVal, where, vendors, totalCount, totalPages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                skip = ((parseInt(pagination.page)) - 1) * parseInt(pagination.take);
                takeVal = parseInt(pagination.take);
                where = {
                // isVerified: true,
                };
                if (filters === null || filters === void 0 ? void 0 : filters.name) {
                    where.name = {
                        contains: filters.name,
                        mode: 'insensitive'
                    };
                }
                if (filters === null || filters === void 0 ? void 0 : filters.userId) {
                    where.userId = filters.userId;
                }
                // Apply new status filters
                if ((filters === null || filters === void 0 ? void 0 : filters.isVerified) !== undefined) {
                    where.isVerified = filters.isVerified;
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.isPublished) !== undefined) {
                    where.isPublished = filters.isPublished;
                }
                // Apply new date created filters
                if ((filters === null || filters === void 0 ? void 0 : filters.createdAtStart) || (filters === null || filters === void 0 ? void 0 : filters.createdAtEnd)) {
                    where.createdAt = {};
                    if (filters.createdAtStart) {
                        where.createdAt.gte = new Date(filters.createdAtStart);
                    }
                    if (filters.createdAtEnd) {
                        where.createdAt.lte = new Date(filters.createdAtEnd);
                    }
                }
                return [4 /*yield*/, prisma.vendor.findMany({
                        where: where,
                        //include,
                        skip: skip,
                        take: takeVal,
                        orderBy: {
                            createdAt: "desc"
                        }
                    })];
            case 1:
                vendors = _a.sent();
                return [4 /*yield*/, prisma.vendor.count({
                        where: where
                    })];
            case 2:
                totalCount = _a.sent();
                totalPages = Math.ceil(totalCount / parseInt(pagination.take));
                return [2 /*return*/, { page: parseInt(pagination.page), totalPages: totalPages, pageSize: takeVal, totalCount: totalCount, data: vendors }];
        }
    });
}); };
exports.getFullListOfVendors = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendor.findMany({
                where: {
                // isVerified: true
                }
            })];
    });
}); };
exports.getVendorsByUserId = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendor.findMany({
                where: { userId: userId }
            })];
    });
}); };
exports.updateVendor = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    var imageBuffer, mockFile, uploadResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(payload.image && !payload.image.startsWith('http'))) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                imageBuffer = Buffer.from(payload.image, 'base64');
                mockFile = {
                    fieldname: 'image',
                    originalname: id + "-store-image.jpg",
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    buffer: imageBuffer,
                    size: imageBuffer.length,
                    stream: new (require('stream').Readable)(),
                    destination: '',
                    filename: '',
                    path: ''
                };
                return [4 /*yield*/, media_service_1.uploadMedia(mockFile, id, 'store_image')];
            case 2:
                uploadResult = _a.sent();
                payload.image = uploadResult.cloudinaryResult.secure_url; // Update payload with the new URL
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error uploading new vendor image during update:', error_1);
                // Decide on error handling. For now, we'll remove the image from the payload
                // so it doesn't overwrite the existing URL with a base64 string.
                delete payload.image;
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, prisma.vendor.update({
                    where: { id: id },
                    data: payload
                })];
        }
    });
}); };
exports.deleteVendor = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendor["delete"]({
                where: { id: id }
            })];
    });
}); };
/**
 * Retrieves all vendors for a user and includes a count of their associated products.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of vendors with their product counts.
 */
exports.getVendorsByUserIdWithProductCount = function (userId) {
    return prisma.vendor.findMany({
        where: {
            userId: userId
        },
        include: {
            _count: {
                select: { vendorProducts: true }
            }
        }
    });
};
/**
 * Retrieves the count of documents for a given vendor ID.
 * @param vendorId - The ID of the vendor.
 * @returns A promise that resolves to the number of documents.
 */
exports.getVendorDocumentCount = function (vendorId) {
    return prisma.media.count({
        where: {
            referenceId: vendorId,
            referenceType: 'document'
        }
    });
};
/**
 * Retrieves the count of documents for a given list of vendor IDs.
 * @param vendorIds - An array of vendor IDs.
 * @returns A promise that resolves to an array of objects containing the vendor ID (`referenceId`) and its document count (`_count._all`).
 */
exports.getVendorDocumentCounts = function (vendorIds) {
    return prisma.media.groupBy({
        by: ['referenceId'],
        where: {
            referenceId: { "in": vendorIds },
            referenceType: 'document'
        },
        _count: {
            _all: true
        }
    });
};
