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
exports.searchStoreProducts = exports.searchByCategoryName = exports.searchByStoreName = exports.searchByProductName = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Stub for existing function
exports.searchByProductName = function (searchTerm, userLatitude, userLongitude) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('searchByProductName called with:', searchTerm, userLatitude, userLongitude);
        // In a real implementation, you would perform a database query here.
        return [2 /*return*/, []];
    });
}); };
// Stub for existing function
exports.searchByStoreName = function (searchTerm, userLatitude, userLongitude) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('searchByStoreName called with:', searchTerm, userLatitude, userLongitude);
        // In a real implementation, you would perform a database query here.
        return [2 /*return*/, []];
    });
}); };
// Stub for existing function
exports.searchByCategoryName = function (searchTerm, latitude, longitude) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('searchByCategoryName called with:', searchTerm, latitude, longitude);
        // In a real implementation, you would perform a database query here.
        return [2 /*return*/, []];
    });
}); };
exports.searchStoreProducts = function (storeId, searchTerm, categoryId) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor, where, productsWithIncludes, groupedByParentCategory, _loop_1, _i, productsWithIncludes_1, vendorProductWithIncludes;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, prisma.vendor.findUnique({ where: { id: storeId } })];
            case 1:
                vendor = _b.sent();
                if (!vendor) {
                    return [2 /*return*/, null]; // Service layer will handle the 404
                }
                where = {
                    vendorId: storeId,
                    isAvailable: true
                };
                if (searchTerm) {
                    where.product = {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    };
                }
                if (categoryId) {
                    where.categories = {
                        some: {
                            id: categoryId
                        }
                    };
                }
                // If searchTerm or categoryId is provided, return a flat list of products.
                if (searchTerm || categoryId) {
                    return [2 /*return*/, prisma.vendorProduct.findMany({
                            where: where
                        })];
                }
                return [4 /*yield*/, prisma.vendorProduct.findMany({
                        where: where,
                        include: {
                            product: true,
                            categories: {
                                include: {
                                    parent: true
                                }
                            }
                        }
                    })];
            case 2:
                productsWithIncludes = _b.sent();
                groupedByParentCategory = new Map();
                _loop_1 = function (vendorProductWithIncludes) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    var categories = vendorProductWithIncludes.categories, product = vendorProductWithIncludes.product, cleanedVendorProduct = __rest(vendorProductWithIncludes, ["categories", "product"]);
                    if (!categories || categories.length === 0)
                        return "continue";
                    for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
                        var category = categories_1[_i];
                        // Use the parent category for grouping, or the category itself if it's a top-level one.
                        var groupCategory = (_a = category.parent) !== null && _a !== void 0 ? _a : category;
                        if (!groupedByParentCategory.has(groupCategory.id)) {
                            groupedByParentCategory.set(groupCategory.id, {
                                category: groupCategory,
                                products: []
                            });
                        }
                        var group = groupedByParentCategory.get(groupCategory.id);
                        // Avoid adding the same product multiple times under the same parent category group
                        if (!group.products.find(function (p) { return p.id === cleanedVendorProduct.id; })) {
                            group.products.push(cleanedVendorProduct);
                        }
                    }
                };
                for (_i = 0, productsWithIncludes_1 = productsWithIncludes; _i < productsWithIncludes_1.length; _i++) {
                    vendorProductWithIncludes = productsWithIncludes_1[_i];
                    _loop_1(vendorProductWithIncludes);
                }
                return [2 /*return*/, Array.from(groupedByParentCategory.values())];
        }
    });
}); };
