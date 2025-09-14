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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.searchStoreProducts = exports.vendorCategoryWithProducts = exports.searchByCategoryId = exports.searchByCategoryName = exports.searchByStoreName = exports.searchByProductName = void 0;
var client_1 = require("@prisma/client");
var getPreciseDistance_1 = require("geolib/es/getPreciseDistance");
var prisma = new client_1.PrismaClient();
exports.searchByProductName = function (searchTerm, userLatitude, userLongitude) { return __awaiter(void 0, void 0, Promise, function () {
    var vendors, storesWithProducts, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.vendor.findMany({
                        where: {
                            vendorProducts: {
                                some: {
                                    product: {
                                        name: {
                                            contains: searchTerm,
                                            mode: 'insensitive'
                                        }
                                    }
                                }
                            }
                        }
                    })];
            case 1:
                vendors = _a.sent();
                if (!vendors || vendors.length === 0) {
                    return [2 /*return*/, { stores: [] }];
                }
                return [4 /*yield*/, Promise.all(vendors.map(function (vendor) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, products, totalProducts, distance;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, prisma.$transaction([
                                        prisma.vendorProduct.findMany({
                                            where: {
                                                vendorId: vendor.id,
                                                product: {
                                                    name: {
                                                        contains: searchTerm,
                                                        mode: 'insensitive'
                                                    }
                                                }
                                            },
                                            take: 10
                                        }),
                                        prisma.vendorProduct.count({
                                            where: {
                                                vendorId: vendor.id,
                                                product: {
                                                    name: {
                                                        contains: searchTerm,
                                                        mode: 'insensitive'
                                                    }
                                                }
                                            }
                                        }),
                                    ])];
                                case 1:
                                    _a = _b.sent(), products = _a[0], totalProducts = _a[1];
                                    distance = getPreciseDistance_1["default"]({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
                                    return [2 /*return*/, {
                                            vendor: __assign(__assign({}, vendor), { distance: distance / 1000 }),
                                            products: products,
                                            totalProducts: totalProducts
                                        }];
                            }
                        });
                    }); }))];
            case 2:
                storesWithProducts = _a.sent();
                // 3. Sort stores by distance
                storesWithProducts.sort(function (a, b) { return a.vendor.distance - b.vendor.distance; });
                return [2 /*return*/, { stores: storesWithProducts }];
            case 3:
                error_1 = _a.sent();
                console.error('Error in searchByProductName:', error_1);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.searchByStoreName = function (searchTerm, userLatitude, userLongitude) { return __awaiter(void 0, void 0, Promise, function () {
    var vendors, vendorsWithDistance, storesWithProducts, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.vendor.findMany({
                        where: {
                            name: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        }
                    })];
            case 1:
                vendors = _a.sent();
                if (!vendors || vendors.length === 0) {
                    return [2 /*return*/, { stores: [] }];
                }
                vendorsWithDistance = vendors.map(function (vendor) {
                    var distance = getPreciseDistance_1["default"]({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
                    return __assign(__assign({}, vendor), { distance: distance / 1000 });
                });
                // 3. Sort vendors by distance (closest first).
                vendorsWithDistance.sort(function (a, b) { return a.distance - b.distance; });
                return [4 /*yield*/, Promise.all(vendorsWithDistance.map(function (vendor) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, products, totalProducts;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, prisma.$transaction([
                                        prisma.vendorProduct.findMany({
                                            where: { vendorId: vendor.id },
                                            take: 10,
                                            orderBy: { createdAt: 'desc' }
                                        }),
                                        prisma.vendorProduct.count({
                                            where: { vendorId: vendor.id }
                                        }),
                                    ])];
                                case 1:
                                    _a = _b.sent(), products = _a[0], totalProducts = _a[1];
                                    return [2 /*return*/, { vendor: vendor, products: products, totalProducts: totalProducts }];
                            }
                        });
                    }); }))];
            case 2:
                storesWithProducts = _a.sent();
                return [2 /*return*/, { stores: storesWithProducts }];
            case 3:
                error_2 = _a.sent();
                console.error('Error in searchByStoreName:', error_2);
                throw error_2;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.searchByCategoryName = function (searchTerm, userLatitude, userLongitude) { return __awaiter(void 0, void 0, Promise, function () {
    var categories, categoryIds_1, allCategoryIds_1, vendorsWithProducts, storesWithProducts, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, prisma.category.findMany({
                        where: {
                            name: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        },
                        include: {
                            children: true
                        }
                    })];
            case 1:
                categories = _a.sent();
                if (!categories.length) {
                    return [2 /*return*/, { stores: [] }];
                }
                categoryIds_1 = new Set();
                categories.forEach(function (category) {
                    categoryIds_1.add(category.id);
                    category.children.forEach(function (child) { return categoryIds_1.add(child.id); });
                });
                allCategoryIds_1 = Array.from(categoryIds_1);
                return [4 /*yield*/, prisma.vendor.findMany({
                        where: {
                            vendorProducts: {
                                some: {
                                    categories: {
                                        some: {
                                            id: { "in": allCategoryIds_1 }
                                        }
                                    }
                                }
                            }
                        },
                        include: {
                            vendorProducts: {
                                where: {
                                    categories: { some: { id: { "in": allCategoryIds_1 } } }
                                },
                                take: 10,
                                orderBy: { createdAt: 'desc' }
                            }
                        }
                    })];
            case 2:
                vendorsWithProducts = _a.sent();
                return [4 /*yield*/, Promise.all(vendorsWithProducts.map(function (vendor) { return __awaiter(void 0, void 0, void 0, function () {
                        var distance, vendorProducts, storeDetails, totalProducts;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    distance = getPreciseDistance_1["default"]({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
                                    vendorProducts = vendor.vendorProducts, storeDetails = __rest(vendor, ["vendorProducts"]);
                                    return [4 /*yield*/, prisma.vendorProduct.count({
                                            where: {
                                                vendorId: vendor.id,
                                                categories: { some: { id: { "in": allCategoryIds_1 } } }
                                            }
                                        })];
                                case 1:
                                    totalProducts = _a.sent();
                                    return [2 /*return*/, {
                                            vendor: __assign(__assign({}, storeDetails), { distance: distance / 1000 }),
                                            products: vendorProducts,
                                            totalProducts: totalProducts
                                        }];
                            }
                        });
                    }); }))];
            case 3:
                storesWithProducts = _a.sent();
                storesWithProducts.sort(function (a, b) { return a.vendor.distance - b.vendor.distance; });
                return [2 /*return*/, { stores: storesWithProducts }];
            case 4:
                error_3 = _a.sent();
                console.error('Error in searchByCategoryName:', error_3);
                throw error_3;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.searchByCategoryId = function (categoryId, userLatitude, userLongitude) { return __awaiter(void 0, void 0, Promise, function () {
    var allCategories, childrenMap_1, getDescendantIds, descendantIds, allCategoryIds_2, vendors, storesWithProducts, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, prisma.category.findMany({
                        select: { id: true, parentId: true }
                    })];
            case 1:
                allCategories = _a.sent();
                childrenMap_1 = new Map();
                allCategories.forEach(function (c) {
                    if (c.parentId) {
                        if (!childrenMap_1.has(c.parentId)) {
                            childrenMap_1.set(c.parentId, []);
                        }
                        childrenMap_1.get(c.parentId).push(c.id);
                    }
                });
                getDescendantIds = function (catId) {
                    var descendants = [];
                    var queue = __spreadArrays((childrenMap_1.get(catId) || []));
                    var visited = new Set(queue);
                    while (queue.length > 0) {
                        var currentId = queue.shift();
                        descendants.push(currentId);
                        var children = childrenMap_1.get(currentId) || [];
                        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                            var childId = children_1[_i];
                            if (!visited.has(childId)) {
                                visited.add(childId);
                                queue.push(childId);
                            }
                        }
                    }
                    return descendants;
                };
                descendantIds = getDescendantIds(categoryId);
                allCategoryIds_2 = __spreadArrays([categoryId], descendantIds);
                return [4 /*yield*/, prisma.vendor.findMany({
                        where: {
                            vendorProducts: {
                                some: {
                                    categories: {
                                        some: {
                                            id: { "in": allCategoryIds_2 }
                                        }
                                    }
                                }
                            }
                        }
                    })];
            case 2:
                vendors = _a.sent();
                if (!vendors || vendors.length === 0) {
                    return [2 /*return*/, { stores: [] }];
                }
                return [4 /*yield*/, Promise.all(vendors.map(function (vendor) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, products, totalProducts, distance;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, prisma.$transaction([
                                        prisma.vendorProduct.findMany({
                                            where: {
                                                vendorId: vendor.id,
                                                categories: {
                                                    some: { id: { "in": allCategoryIds_2 } }
                                                }
                                            },
                                            take: 10,
                                            orderBy: { createdAt: 'desc' }
                                        }),
                                        prisma.vendorProduct.count({
                                            where: {
                                                vendorId: vendor.id,
                                                categories: {
                                                    some: { id: { "in": allCategoryIds_2 } }
                                                }
                                            }
                                        }),
                                    ])];
                                case 1:
                                    _a = _b.sent(), products = _a[0], totalProducts = _a[1];
                                    distance = getPreciseDistance_1["default"]({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
                                    return [2 /*return*/, { vendor: __assign(__assign({}, vendor), { distance: distance / 1000 }), products: products, totalProducts: totalProducts }];
                            }
                        });
                    }); }))];
            case 3:
                storesWithProducts = _a.sent();
                // Sort stores by distance
                storesWithProducts.sort(function (a, b) { return a.vendor.distance - b.vendor.distance; });
                return [2 /*return*/, { stores: storesWithProducts }];
            case 4:
                error_4 = _a.sent();
                console.error('Error in searchByCategoryId:', error_4);
                throw error_4;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.vendorCategoryWithProducts = function (vendorId, parentCategoryId) { return __awaiter(void 0, void 0, Promise, function () {
    var allCategories, childrenMap_2, getDescendantIds, baseCategories, results, _i, baseCategories_1, baseCategory, descendantIds, categoryIdsToFetch, products, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, prisma.category.findMany()];
            case 1:
                allCategories = _a.sent();
                childrenMap_2 = new Map();
                allCategories.forEach(function (c) {
                    if (c.parentId) {
                        if (!childrenMap_2.has(c.parentId)) {
                            childrenMap_2.set(c.parentId, []);
                        }
                        childrenMap_2.get(c.parentId).push(c.id);
                    }
                });
                getDescendantIds = function (categoryId) {
                    var descendants = [];
                    var queue = __spreadArrays((childrenMap_2.get(categoryId) || []));
                    var visited = new Set(queue);
                    while (queue.length > 0) {
                        var currentId = queue.shift();
                        descendants.push(currentId);
                        var children = childrenMap_2.get(currentId) || [];
                        for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
                            var childId = children_2[_i];
                            if (!visited.has(childId)) {
                                visited.add(childId);
                                queue.push(childId);
                            }
                        }
                    }
                    return descendants;
                };
                baseCategories = parentCategoryId
                    ? allCategories.filter(function (c) { return c.parentId === parentCategoryId; })
                    : allCategories.filter(function (c) { return c.parentId === null; });
                results = [];
                _i = 0, baseCategories_1 = baseCategories;
                _a.label = 2;
            case 2:
                if (!(_i < baseCategories_1.length)) return [3 /*break*/, 5];
                baseCategory = baseCategories_1[_i];
                descendantIds = getDescendantIds(baseCategory.id);
                categoryIdsToFetch = __spreadArrays([baseCategory.id], descendantIds);
                return [4 /*yield*/, prisma.vendorProduct.findMany({
                        where: {
                            vendorId: vendorId,
                            categories: {
                                some: {
                                    id: { "in": categoryIdsToFetch }
                                }
                            }
                        }
                    })];
            case 3:
                products = _a.sent();
                // 5. If there are products, add to results.
                if (products.length > 0) {
                    results.push({
                        category: baseCategory,
                        products: products
                    });
                }
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, results];
            case 6:
                error_5 = _a.sent();
                console.error('Error fetching categories with products for vendor:', error_5);
                throw error_5; // Re-throw for centralized error handling
            case 7: return [2 /*return*/];
        }
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
