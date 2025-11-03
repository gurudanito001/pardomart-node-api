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
exports.deleteVendorProduct = exports.transferVendorProducts = exports.deleteProduct = exports.updateVendorProduct = exports.updateProductBase = exports.getTrendingVendorProducts = exports.getVendorProductsByUserId = exports.getVendorProductsByIds = exports.getVendorProductById = exports.getVendorProductsByCategory = exports.getAllProducts = exports.getVendorProductsByTagIds = exports.getProductsByTagIds = exports.getVendorProductsByOwnerId = exports.getAllVendorProducts = exports.getVendorProductsForProduct = exports.adminGetAllProducts = exports.getProductOverview = exports.getVendorProductByBarcode = exports.getProductByBarcode = exports.createVendorProduct = exports.createProduct = void 0;
// models/product.model.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
exports.createProduct = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var categoryIds, tagIds, restOfPayload;
    return __generator(this, function (_a) {
        categoryIds = payload.categoryIds, tagIds = payload.tagIds, restOfPayload = __rest(payload, ["categoryIds", "tagIds"]);
        return [2 /*return*/, prisma.product.create({
                data: __assign(__assign({}, restOfPayload), { categories: {
                        connect: categoryIds === null || categoryIds === void 0 ? void 0 : categoryIds.map(function (id) { return ({ id: id }); })
                    }, tags: {
                        connect: tagIds === null || tagIds === void 0 ? void 0 : tagIds.map(function (id) { return ({ id: id }); })
                    } }),
                include: {
                    categories: true,
                    tags: true
                }
            })];
    });
}); };
exports.createVendorProduct = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var id, categoryIds, tagIds, productId, vendorId, restOfPayload;
    return __generator(this, function (_a) {
        id = payload.id, categoryIds = payload.categoryIds, tagIds = payload.tagIds, productId = payload.productId, vendorId = payload.vendorId, restOfPayload = __rest(payload, ["id", "categoryIds", "tagIds", "productId", "vendorId"]);
        return [2 /*return*/, prisma.vendorProduct.create({
                data: __assign(__assign({}, restOfPayload), { id: id, vendorId: vendorId, productId: productId, categories: {
                        connect: categoryIds === null || categoryIds === void 0 ? void 0 : categoryIds.map(function (id) { return ({ id: id }); })
                    }, tags: {
                        connect: tagIds === null || tagIds === void 0 ? void 0 : tagIds.map(function (id) { return ({ id: id }); })
                    } }),
                include: {
                    product: true,
                    categories: true,
                    tags: true
                }
            })];
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
/**
 * Retrieves an overview of product counts from the database.
 * @returns An object containing the total number of products and vendor products.
 */
exports.getProductOverview = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, totalProducts, totalVendorProducts;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, prisma.$transaction([
                    prisma.product.count(),
                    prisma.vendorProduct.count(),
                ])];
            case 1:
                _a = _b.sent(), totalProducts = _a[0], totalVendorProducts = _a[1];
                return [2 /*return*/, {
                        totalProducts: totalProducts,
                        totalVendorProducts: totalVendorProducts
                    }];
        }
    });
}); };
/**
 * (Admin) Retrieves a paginated list of all base products with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of products.
 */
exports.adminGetAllProducts = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var page, take, skip, where, _a, products, totalCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = parseInt(pagination.page, 10);
                take = parseInt(pagination.take, 10);
                skip = (page - 1) * take;
                where = {};
                if (filters.name) {
                    where.name = {
                        contains: filters.name,
                        mode: 'insensitive'
                    };
                }
                if (filters.categoryId) {
                    where.categories = {
                        some: {
                            id: filters.categoryId
                        }
                    };
                }
                if (filters.isAlcohol !== undefined) {
                    where.isAlcohol = filters.isAlcohol;
                }
                if (filters.isAgeRestricted !== undefined) {
                    where.isAgeRestricted = filters.isAgeRestricted;
                }
                return [4 /*yield*/, prisma.$transaction([
                        prisma.product.findMany({
                            where: where,
                            include: {
                                categories: { select: { id: true, name: true } },
                                _count: {
                                    select: { vendorProducts: true }
                                }
                            },
                            skip: skip,
                            take: take,
                            orderBy: { name: 'asc' }
                        }),
                        prisma.product.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), products = _a[0], totalCount = _a[1];
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, { page: page, totalPages: totalPages, pageSize: take, totalCount: totalCount, data: products }];
        }
    });
}); };
/**
 * (Admin) Retrieves a paginated list of all vendor products for a specific base product.
 * @param productId - The ID of the base product.
 * @param pagination - The pagination options.
 * @returns A paginated list of vendor products.
 */
exports.getVendorProductsForProduct = function (productId, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var page, take, skip, product, where, _a, vendorProducts, totalCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = parseInt(pagination.page, 10);
                take = parseInt(pagination.size, 10);
                skip = (page - 1) * take;
                return [4 /*yield*/, prisma.product.findUnique({ where: { id: productId } })];
            case 1:
                product = _b.sent();
                if (!product) {
                    throw new Error('Base product not found.');
                }
                where = {
                    productId: productId
                };
                return [4 /*yield*/, prisma.$transaction([
                        prisma.vendorProduct.findMany({
                            where: where,
                            include: {
                                vendor: {
                                    select: { id: true, name: true, isVerified: true, isPublished: true }
                                }
                            },
                            skip: skip,
                            take: take,
                            orderBy: { vendor: { name: 'asc' } }
                        }),
                        prisma.vendorProduct.count({ where: where }),
                    ])];
            case 2:
                _a = _b.sent(), vendorProducts = _a[0], totalCount = _a[1];
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, {
                        data: vendorProducts,
                        page: page,
                        totalPages: totalPages,
                        pageSize: take,
                        totalCount: totalCount
                    }];
        }
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
/**
 * Retrieves all vendor products for all stores owned by a specific user.
 * @param ownerId - The user ID of the vendor owner.
 * @returns A list of vendor products with their base product and vendor details.
 */
exports.getVendorProductsByOwnerId = function (ownerId, vendorId, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var where, page, take, skip, _a, vendorProducts, totalCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                where = {
                    vendor: {
                        userId: ownerId
                    }
                };
                if (vendorId) {
                    where.vendorId = vendorId;
                }
                page = parseInt((pagination === null || pagination === void 0 ? void 0 : pagination.page) || '1', 10);
                take = parseInt((pagination === null || pagination === void 0 ? void 0 : pagination.take) || '20', 10);
                skip = (page - 1) * take;
                return [4 /*yield*/, prisma.$transaction([
                        prisma.vendorProduct.findMany({
                            where: where,
                            include: {
                                product: true,
                                vendor: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                categories: true,
                                tags: true
                            },
                            orderBy: {
                                vendor: {
                                    name: 'asc'
                                }
                            },
                            skip: skip,
                            take: take
                        }),
                        prisma.vendorProduct.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), vendorProducts = _a[0], totalCount = _a[1];
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, { page: page, totalPages: totalPages, pageSize: take, totalCount: totalCount, data: vendorProducts }];
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
        return [2 /*return*/, prisma.product.findMany({
                include: {
                    categories: true,
                    tags: true,
                    vendorProducts: true
                }
            })];
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
                where: { id: vendorProductId },
                include: {
                    vendor: true,
                    categories: true,
                    tags: true
                }
            })];
    });
}); };
/**
 * Retrieves multiple vendor products by their IDs.
 * @param vendorProductIds An array of vendor product IDs.
 * @returns A list of vendor products with their relations.
 */
exports.getVendorProductsByIds = function (vendorProductIds) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct.findMany({
                where: { id: { "in": vendorProductIds } },
                include: {
                    vendor: true,
                    categories: true,
                    tags: true
                }
            })];
    });
}); };
exports.getVendorProductsByUserId = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct.findMany({
                where: {
                    vendor: {
                        userId: userId
                    }
                },
                orderBy: { createdAt: 'desc' }
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
/**
 * Copies a vendor product to other stores, skipping stores where it already exists.
 * @param sourceProduct The full source VendorProduct object.
 * @param targetVendorIds An array of store IDs to copy to.
 * @returns An object with arrays of transferred and skipped vendor IDs.
 */
exports.transferVendorProducts = function (sourceProduct, targetVendorIds) { return __awaiter(void 0, void 0, Promise, function () {
    var transferred, skipped, _i, targetVendorIds_1, targetVendorId, existingProduct;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                transferred = [];
                skipped = [];
                _i = 0, targetVendorIds_1 = targetVendorIds;
                _b.label = 1;
            case 1:
                if (!(_i < targetVendorIds_1.length)) return [3 /*break*/, 5];
                targetVendorId = targetVendorIds_1[_i];
                return [4 /*yield*/, prisma.vendorProduct.findUnique({
                        where: {
                            vendorId_productId: {
                                vendorId: targetVendorId,
                                productId: sourceProduct.productId
                            }
                        }
                    })];
            case 2:
                existingProduct = _b.sent();
                if (existingProduct) {
                    skipped.push(targetVendorId);
                    return [3 /*break*/, 4]; // Skip to the next store
                }
                // Create the new vendor product, copying details from the source
                return [4 /*yield*/, prisma.vendorProduct.create({
                        data: {
                            vendor: { connect: { id: targetVendorId } },
                            product: { connect: { id: sourceProduct.productId } },
                            name: sourceProduct.name,
                            description: sourceProduct.description,
                            price: sourceProduct.price,
                            discountedPrice: sourceProduct.discountedPrice,
                            images: sourceProduct.images,
                            weight: sourceProduct.weight,
                            weightUnit: sourceProduct.weightUnit,
                            isAvailable: sourceProduct.isAvailable,
                            isAlcohol: sourceProduct.isAlcohol,
                            isAgeRestricted: sourceProduct.isAgeRestricted,
                            attributes: (_a = sourceProduct.attributes) !== null && _a !== void 0 ? _a : client_1.Prisma.JsonNull,
                            categories: {
                                connect: sourceProduct.categories.map(function (c) { return ({ id: c.id }); })
                            },
                            tags: {
                                connect: sourceProduct.tags.map(function (t) { return ({ id: t.id }); })
                            }
                        }
                    })];
            case 3:
                // Create the new vendor product, copying details from the source
                _b.sent();
                transferred.push(targetVendorId);
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/, { transferred: transferred, skipped: skipped }];
        }
    });
}); };
exports.deleteVendorProduct = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.vendorProduct["delete"]({
                where: { id: id }
            })];
    });
}); };
