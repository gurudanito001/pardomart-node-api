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
exports.deleteVendorProduct = exports.deleteProduct = exports.updateVendorProduct = exports.updateProductBase = exports.getTrendingVendorProducts = exports.getVendorProductById = exports.getVendorProductsByCategory = exports.getAllProducts = exports.getVendorProductsByTagIds = exports.getProductsByTagIds = exports.getAllVendorProducts = exports.getVendorProductByBarcode = exports.getProductByBarcode = exports.createVendorProductWithBarcode = exports.createVendorProduct = exports.createProduct = void 0;
// models/product.model.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
exports.createProduct = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        return [2 /*return*/, prisma.product.create({
                data: __assign(__assign({}, payload), { categories: {
                        connect: (_a = payload.categoryIds) === null || _a === void 0 ? void 0 : _a.map(function (id) { return ({ id: id }); })
                    }, tags: {
                        connect: (_b = payload.tagIds) === null || _b === void 0 ? void 0 : _b.map(function (id) { return ({ id: id }); })
                    } }),
                include: {
                    categories: true,
                    tags: true
                }
            })];
    });
}); };
exports.createVendorProduct = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        return [2 /*return*/, prisma.vendorProduct.create({
                data: __assign(__assign({}, payload), { categories: {
                        connect: (_a = payload.categoryIds) === null || _a === void 0 ? void 0 : _a.map(function (id) { return ({ id: id }); })
                    }, tags: {
                        connect: (_b = payload.tagIds) === null || _b === void 0 ? void 0 : _b.map(function (id) { return ({ id: id }); })
                    } }),
                include: {
                    product: true,
                    categories: true,
                    tags: true
                }
            })];
    });
}); };
exports.createVendorProductWithBarcode = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var product, productId, newProduct, vendorProductPayload;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, prisma.product.findUnique({
                    where: { barcode: payload.barcode }
                })];
            case 1:
                product = _e.sent();
                if (!!product) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.product.create({
                        data: {
                            barcode: payload.barcode,
                            name: payload.name || 'Default Product Name',
                            description: payload.description,
                            images: payload.images || [],
                            attributes: payload.attributes,
                            categories: {
                                connect: (_a = payload.categoryIds) === null || _a === void 0 ? void 0 : _a.map(function (id) { return ({ id: id }); })
                            },
                            tags: {
                                connect: (_b = payload.tagIds) === null || _b === void 0 ? void 0 : _b.map(function (id) { return ({ id: id }); })
                            }
                        },
                        include: {
                            categories: true,
                            tags: true
                        }
                    })];
            case 2:
                newProduct = _e.sent();
                productId = newProduct.id;
                return [3 /*break*/, 4];
            case 3:
                productId = product.id;
                _e.label = 4;
            case 4:
                vendorProductPayload = {
                    vendorId: payload.vendorId,
                    productId: productId,
                    price: payload.price,
                    name: payload.name,
                    description: payload.description,
                    discountedPrice: payload.discountedPrice,
                    sku: payload.sku,
                    images: payload.images || [],
                    stock: payload.stock,
                    isAvailable: payload.isAvailable,
                    attributes: payload.attributes,
                    categories: {
                        connect: (_c = payload.categoryIds) === null || _c === void 0 ? void 0 : _c.map(function (id) { return ({ id: id }); })
                    },
                    tags: {
                        connect: (_d = payload.tagIds) === null || _d === void 0 ? void 0 : _d.map(function (id) { return ({ id: id }); })
                    }
                };
                return [2 /*return*/, prisma.vendorProduct.create({
                        data: vendorProductPayload,
                        include: {
                            product: true,
                            categories: true,
                            tags: true
                        }
                    })];
        }
    });
}); };
exports.getProductByBarcode = function (barcode) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.product.findUnique({
                where: { barcode: barcode },
                include: {
                    categories: true,
                    tags: true
                }
            })];
    });
}); };
exports.getVendorProductByBarcode = function (barcode, vendorId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct.findFirst({
                where: {
                    vendorId: vendorId,
                    product: { barcode: barcode }
                },
                include: { product: true, categories: true, tags: true }
            })];
    });
}); };
exports.getAllVendorProducts = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var skip, takeVal, where, vendorProducts, totalCount, totalPages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                skip = ((parseInt(pagination.page)) - 1) * parseInt(pagination.take);
                takeVal = parseInt(pagination.take);
                where = {};
                if (filters === null || filters === void 0 ? void 0 : filters.name) {
                    where.name = {
                        contains: filters.name,
                        mode: 'insensitive'
                    };
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.tagIds) && filters.tagIds.length > 0) {
                    where.tags = {
                        some: {
                            id: {
                                "in": filters.tagIds
                            }
                        }
                    };
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.categoryIds) && filters.categoryIds.length > 0) {
                    where.product = {
                        categories: {
                            some: {
                                id: {
                                    "in": filters.categoryIds
                                }
                            }
                        }
                    };
                }
                if (filters === null || filters === void 0 ? void 0 : filters.vendorId) {
                    where.vendorId = filters.vendorId;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.productId) {
                    where.productId = filters.productId;
                }
                return [4 /*yield*/, prisma.vendorProduct.findMany({
                        where: where,
                        include: {
                            categories: true
                        },
                        skip: skip,
                        take: takeVal
                    })];
            case 1:
                vendorProducts = _a.sent();
                return [4 /*yield*/, prisma.vendorProduct.count({
                        where: where
                    })];
            case 2:
                totalCount = _a.sent();
                totalPages = Math.ceil(totalCount / parseInt(pagination.take));
                return [2 /*return*/, { page: parseInt(pagination.page), totalPages: totalPages, pageSize: takeVal, totalCount: totalCount, data: vendorProducts }];
        }
    });
}); };
exports.getProductsByTagIds = function (tagIds) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.product.findMany({
                where: {
                    tags: {
                        some: {
                            id: {
                                "in": tagIds
                            }
                        }
                    }
                },
                include: {
                    tags: true,
                    categories: true
                }
            })];
    });
}); };
exports.getVendorProductsByTagIds = function (tagIds) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct.findMany({
                where: {
                    tags: {
                        some: {
                            id: {
                                "in": tagIds
                            }
                        }
                    }
                },
                include: {
                    tags: true,
                    categories: true
                }
            })];
    });
}); };
exports.getAllProducts = function () { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.order.deleteMany()];
            case 1:
                _a.sent();
                return [2 /*return*/, prisma.product.findMany({
                        include: {
                            categories: true,
                            tags: true,
                            vendorProducts: true
                        }
                    })];
        }
    });
}); };
exports.getVendorProductsByCategory = function (vendorId, categoryId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct.findMany({
                where: {
                    vendorId: vendorId,
                    product: {
                        categories: {
                            some: {
                                id: categoryId
                            }
                        }
                    }
                },
                include: {
                    product: true,
                    tags: true,
                    categories: true
                }
            })];
    });
}); };
exports.getVendorProductById = function (vendorProductId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct.findUnique({
                where: { id: vendorProductId }
            })];
    });
}); };
/**
 * Retrieves a paginated list of trending vendor products.
 * Trending is defined by the number of times a product appears in order items.
 *
 * @param filters - Filtering options, currently supports `vendorId`.
 * @param pagination - Pagination options `page` and `take`.
 * @returns A paginated list of vendor products with their trend count.
 */
exports.getTrendingVendorProducts = function (filters, pagination) { return __awaiter(void 0, void 0, Promise, function () {
    var vendorId, pageNum, takeNum, skip, orderItemWhere, trendingProductCounts, trendingVendorProductIds, vendorProducts, productCountMap, vendorProductsWithCount, sortedVendorProducts, totalDistinctProducts, totalCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vendorId = filters.vendorId;
                pageNum = parseInt(pagination.page, 10) || 1;
                takeNum = parseInt(pagination.take, 10) || 5;
                skip = (pageNum - 1) * takeNum;
                orderItemWhere = {};
                if (vendorId) {
                    orderItemWhere.vendorProduct = {
                        vendorId: vendorId
                    };
                }
                return [4 /*yield*/, prisma.orderItem.groupBy({
                        by: ['vendorProductId'],
                        where: orderItemWhere,
                        _count: {
                            vendorProductId: true
                        },
                        orderBy: {
                            _count: {
                                vendorProductId: 'desc'
                            }
                        },
                        skip: skip,
                        take: takeNum
                    })];
            case 1:
                trendingProductCounts = _a.sent();
                trendingVendorProductIds = trendingProductCounts.map(function (item) { return item.vendorProductId; });
                if (trendingVendorProductIds.length === 0) {
                    return [2 /*return*/, { data: [], total: 0, page: pageNum, size: takeNum }];
                }
                return [4 /*yield*/, prisma.vendorProduct.findMany({
                        where: { id: { "in": trendingVendorProductIds } }
                    })];
            case 2:
                vendorProducts = _a.sent();
                productCountMap = new Map();
                trendingProductCounts.forEach(function (p) {
                    productCountMap.set(p.vendorProductId, p._count.vendorProductId);
                });
                vendorProductsWithCount = vendorProducts.map(function (vp) { return (__assign(__assign({}, vp), { orderCount: productCountMap.get(vp.id) || 0 })); });
                sortedVendorProducts = vendorProductsWithCount.sort(function (a, b) { return trendingVendorProductIds.indexOf(a.id) - trendingVendorProductIds.indexOf(b.id); });
                return [4 /*yield*/, prisma.orderItem.groupBy({ by: ['vendorProductId'], where: orderItemWhere })];
            case 3:
                totalDistinctProducts = _a.sent();
                totalCount = totalDistinctProducts.length;
                return [2 /*return*/, { data: sortedVendorProducts, total: totalCount, page: pageNum, size: takeNum }];
        }
    });
}); };
exports.updateProductBase = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var _a;
    return __generator(this, function (_b) {
        return [2 /*return*/, prisma.product.update({
                where: { id: payload.id },
                data: __assign(__assign({}, payload), { categories: {
                        set: (_a = payload.categoryIds) === null || _a === void 0 ? void 0 : _a.map(function (id) { return ({ id: id }); })
                    } }),
                include: {
                    categories: true,
                    vendorProducts: true
                }
            })];
    });
}); };
exports.updateVendorProduct = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct.update({
                where: { id: payload.id },
                data: payload,
                include: {
                    product: true
                }
            })];
    });
}); };
exports.deleteProduct = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.product["delete"]({
                where: { id: id }
            })];
    });
}); };
exports.deleteVendorProduct = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct["delete"]({
                where: { id: id }
            })];
    });
}); };
