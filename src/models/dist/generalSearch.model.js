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
exports.getStoresByProductId = exports.getCategoryDetailsWithRelatedData = exports.getProductsByCategoryId = exports.getVendorCategoriesWithProducts = exports.getVendorsCategoriesAndProducts = void 0;
var client_1 = require("@prisma/client");
var geolib_1 = require("geolib"); // You'll need to install the 'geolib' package: npm install geolib
var prisma = new client_1.PrismaClient();
// 1. Product Search Function
var searchProducts = function (keyword) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.product.findMany({
                where: {
                    name: {
                        contains: keyword,
                        mode: 'insensitive'
                    }
                },
                orderBy: [
                    {
                        name: 'asc'
                    },
                ],
                take: 10
            })];
    });
}); };
// 2. Category Search Function
var searchCategories = function (keyword) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.category.findMany({
                where: {
                    name: {
                        contains: keyword,
                        mode: 'insensitive'
                    }
                },
                include: {
                    children: true
                },
                orderBy: [
                    {
                        name: 'asc'
                    },
                ],
                take: 5
            })];
    });
}); };
// 3. Vendor Search Function
var searchVendors = function (keyword, latitude, longitude) { return __awaiter(void 0, void 0, Promise, function () {
    var vendors, vendorsWithDistance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.vendor.findMany({
                    where: {
                        name: {
                            contains: keyword,
                            mode: 'insensitive'
                        }
                    }
                })];
            case 1:
                vendors = _a.sent();
                vendorsWithDistance = vendors.map(function (vendor) {
                    var distance = geolib_1.getDistance({ latitude: latitude, longitude: longitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 } //handle null lat/long
                    );
                    return __assign(__assign({}, vendor), { distance: distance / 1000 });
                });
                // Sort vendors by distance (closest first)
                vendorsWithDistance.sort(function (a, b) { return a.distance - b.distance; });
                return [2 /*return*/, vendorsWithDistance];
        }
    });
}); };
// 4. Main General Search Function
exports.getVendorsCategoriesAndProducts = function (search, latitude, longitude) { return __awaiter(void 0, void 0, Promise, function () {
    var products, categories, vendors, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, searchProducts(search)];
            case 1:
                products = _a.sent();
                return [4 /*yield*/, searchCategories(search)];
            case 2:
                categories = _a.sent();
                return [4 /*yield*/, searchVendors(search, latitude, longitude)];
            case 3:
                vendors = _a.sent();
                return [2 /*return*/, { products: products, vendors: vendors, categories: categories }];
            case 4:
                error_1 = _a.sent();
                console.error('Error during general search:', error_1);
                throw error_1; // Re-throw for centralized error handling
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getVendorCategoriesWithProducts = function (vendorId, parentCategoryId) { return __awaiter(void 0, void 0, Promise, function () {
    var subCategories, parentCategoriesIds_2, parentCategories, _i, parentCategoriesIds_1, categoryId, category, error_2, categoriesWithProducts, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                return [4 /*yield*/, prisma.category.findMany({
                        where: __assign({ vendorProducts: {
                                some: {
                                    vendorId: vendorId
                                }
                            } }, (parentCategoryId && { parentId: parentCategoryId })),
                        include: {
                            vendorProducts: {
                                where: {
                                    vendorId: vendorId
                                },
                                take: 5
                            }
                        }
                    })];
            case 1:
                subCategories = _a.sent();
                parentCategoriesIds_2 = [];
                parentCategories = [];
                subCategories.forEach(function (item) {
                    if (item === null || item === void 0 ? void 0 : item.parentId) {
                        parentCategoriesIds_2.push(item.parentId);
                    }
                });
                parentCategoriesIds_2 = __spreadArrays(new Set(parentCategoriesIds_2));
                _i = 0, parentCategoriesIds_1 = parentCategoriesIds_2;
                _a.label = 2;
            case 2:
                if (!(_i < parentCategoriesIds_1.length)) return [3 /*break*/, 7];
                categoryId = parentCategoriesIds_1[_i];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, prisma.category.findUnique({
                        where: { id: categoryId }
                    })];
            case 4:
                category = _a.sent();
                if (category) {
                    parentCategories.push(category);
                }
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error("Error fetching category with ID " + categoryId + ":", error_2);
                return [3 /*break*/, 6];
            case 6:
                _i++;
                return [3 /*break*/, 2];
            case 7:
                categoriesWithProducts = subCategories.map(function (category) { return ({
                    category: __assign(__assign({}, category), { vendorProducts: null }),
                    products: category.vendorProducts
                }); });
                return [2 /*return*/, { parentCategories: parentCategories, subCategories: categoriesWithProducts }];
            case 8:
                error_3 = _a.sent();
                console.error('Error fetching categories with products for vendor:', error_3);
                throw error_3; // Re-throw for centralized error handling
            case 9: return [2 /*return*/];
        }
    });
}); };
/**
 * Helper function to get products by category ID, with optional vendor and proximity filtering.
 */
exports.getProductsByCategoryId = function (categoryId, page, take, vendorId, userLatitude, userLongitude) { return __awaiter(void 0, void 0, Promise, function () {
    var where, products, productsWithVendor, totalCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                where = __assign({ product: {
                        categories: {
                            some: {
                                id: {
                                    "in": [categoryId]
                                }
                            }
                        }
                    } }, (vendorId && { vendorId: vendorId }));
                return [4 /*yield*/, prisma.vendorProduct.findMany({
                        where: where,
                        skip: (page - 1) * take,
                        take: take,
                        include: {
                            vendor: {
                                // Include vendor details
                                select: {
                                    id: true,
                                    name: true,
                                    latitude: true,
                                    longitude: true
                                }
                            }
                        }
                    })];
            case 1:
                products = _a.sent();
                productsWithVendor = products.map(function (product) { return ({
                    product: __assign(__assign({}, product), { vendor: null }),
                    vendor: {
                        id: product.vendor.id,
                        name: product.vendor.name,
                        latitude: product.vendor.latitude,
                        longitude: product.vendor.longitude
                    }
                }); });
                // Calculate and sort by proximity
                if (userLatitude && userLongitude) {
                    productsWithVendor = productsWithVendor
                        .map(function (item) {
                        var distance = item.vendor.latitude && item.vendor.longitude
                            ? geolib_1.getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: item.vendor.latitude, longitude: item.vendor.longitude })
                            : Infinity; //  stores without coordinates will be last
                        delete item.product.vendor;
                        return __assign(__assign({}, item.product), { vendor: {
                                name: item.vendor.name,
                                distance: distance / 1000
                            } });
                    })
                        .sort(function (a, b) { return a.vendor.distance - b.vendor.distance; }); // Sort by distance
                }
                return [4 /*yield*/, prisma.vendorProduct.count({ where: where })];
            case 2:
                totalCount = _a.sent();
                return [2 /*return*/, { products: productsWithVendor, totalPages: Math.ceil(totalCount / take), currentPage: page }];
        }
    });
}); };
var getStoresByCategoryOrChildren = function (categoryId, userLatitude, userLongitude, vendorId) { return __awaiter(void 0, void 0, Promise, function () {
    var category, categoryIds, vendorIdsHavingProducts, uniqueVendorIds, vendorsWithProducts, storesWithFormattedProducts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.category.findUnique({
                    where: { id: categoryId },
                    include: { children: true }
                })];
            case 1:
                category = _a.sent();
                if (!category) {
                    throw new Error('Category not found');
                }
                categoryIds = __spreadArrays([categoryId], category.children.map(function (c) { return c.id; }));
                return [4 /*yield*/, prisma.vendorProduct.findMany({
                        where: __assign({ categories: {
                                some: {
                                    id: {
                                        "in": categoryIds
                                    }
                                }
                            } }, (vendorId ? { vendorId: vendorId } : {})),
                        distinct: ['vendorId'],
                        select: {
                            vendorId: true
                        }
                    })];
            case 2:
                vendorIdsHavingProducts = _a.sent();
                uniqueVendorIds = vendorIdsHavingProducts.map(function (v) { return v.vendorId; });
                return [4 /*yield*/, prisma.vendor.findMany({
                        where: {
                            id: {
                                "in": uniqueVendorIds
                            }
                        },
                        include: {
                            vendorProducts: {
                                where: {
                                    categories: {
                                        some: {
                                            id: {
                                                "in": categoryIds
                                            }
                                        }
                                    }
                                },
                                take: 5,
                                orderBy: {
                                    createdAt: 'desc'
                                }
                            }
                        }
                    })];
            case 3:
                vendorsWithProducts = _a.sent();
                storesWithFormattedProducts = vendorsWithProducts.map(function (vendor) {
                    var distance = Infinity;
                    if (userLatitude && userLongitude && vendor.latitude !== null && vendor.longitude !== null) {
                        // Ensure vendor.latitude and vendor.longitude are not null before calculating
                        distance = geolib_1.getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude, longitude: vendor.longitude }) / 1000; // Convert to kilometers
                    }
                    // Destructure vendorProducts to separate them from the rest of the vendor properties
                    var vendorProducts = vendor.vendorProducts, storeDetails = __rest(vendor, ["vendorProducts"]);
                    return {
                        store: __assign(__assign({}, storeDetails), { distance: distance }),
                        products: vendorProducts
                    };
                });
                // 4. Sort the results by distance if user location is provided
                if (userLatitude && userLongitude) {
                    storesWithFormattedProducts.sort(function (a, b) { return a.store.distance - b.store.distance; });
                }
                return [2 /*return*/, storesWithFormattedProducts];
        }
    });
}); };
exports.getCategoryDetailsWithRelatedData = function (_a) {
    var categoryId = _a.categoryId, vendorId = _a.vendorId, userLatitude = _a.userLatitude, userLongitude = _a.userLongitude, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.take, take = _c === void 0 ? 10 : _c;
    return __awaiter(void 0, void 0, Promise, function () {
        var category, stores, error_4;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, prisma.category.findUnique({
                            where: { id: categoryId },
                            include: { children: true }
                        })];
                case 1:
                    category = _d.sent();
                    if (!category) {
                        throw new Error('Category not found');
                    }
                    stores = [];
                    return [4 /*yield*/, getStoresByCategoryOrChildren(categoryId, userLatitude, userLongitude, vendorId)];
                case 2:
                    stores = _d.sent();
                    return [2 /*return*/, { category: { id: category.id, name: category.name, description: category.description, parentId: category.parentId }, stores: stores }];
                case 3:
                    error_4 = _d.sent();
                    console.error('Error in getCategoryDetailsWithRelatedData:', error_4);
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.getStoresByProductId = function (searchTerm, // Changed to searchTerm
userLatitude, userLongitude) { return __awaiter(void 0, void 0, Promise, function () {
    var vendorProducts, vendorProductMap_1, storesWithProducts, sortedStores, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.vendorProduct.findMany({
                        where: {
                            product: {
                                name: {
                                    contains: searchTerm,
                                    mode: 'insensitive' //  case-insensitive search
                                }
                            }
                        },
                        include: {
                            vendor: true,
                            product: true // Include the product in the result
                        }
                    })];
            case 1:
                vendorProducts = _a.sent();
                if (!vendorProducts || vendorProducts.length === 0) {
                    return [2 /*return*/, { stores: [] }];
                }
                vendorProductMap_1 = new Map();
                // Add vendors and products to the map.  Calculate distance here.
                vendorProducts.forEach(function (vProduct) {
                    var distance = geolib_1.getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vProduct.vendor.latitude || 0, longitude: vProduct.vendor.longitude || 0 });
                    var vendorWithDistance = __assign(__assign({}, vProduct.vendor), { distance: distance / 1000 }); // Create a new object
                    if (!vendorProductMap_1.has(vProduct.vendorId)) {
                        vendorProductMap_1.set(vProduct.vendorId, {
                            vendor: vendorWithDistance,
                            products: [vProduct]
                        });
                    }
                    else {
                        vendorProductMap_1.get(vProduct.vendorId).products.push(vProduct);
                    }
                });
                storesWithProducts = Array.from(vendorProductMap_1.values());
                //4. Fetch other products for each vendor.
                return [4 /*yield*/, Promise.all(storesWithProducts.map(function (store) { return __awaiter(void 0, void 0, void 0, function () {
                        var otherProducts;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, prisma.vendorProduct.findMany({
                                        where: {
                                            vendorId: store.vendor.id,
                                            product: {
                                                name: {
                                                    not: {
                                                        contains: searchTerm
                                                    },
                                                    mode: 'insensitive' // Move mode here
                                                }
                                            }
                                        },
                                        take: 4
                                    })];
                                case 1:
                                    otherProducts = _b.sent();
                                    (_a = store.products).push.apply(_a, otherProducts);
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 2:
                //4. Fetch other products for each vendor.
                _a.sent();
                // Sort by distance (closest first)
                storesWithProducts.sort(function (a, b) { return a.vendor.distance - b.vendor.distance; });
                sortedStores = storesWithProducts.map(function (store) {
                    var sortedProducts = store.products.sort(function (a) {
                        return a.name.toLowerCase().includes(searchTerm.toLowerCase()) ? -1 : 1;
                    });
                    return __assign(__assign({}, store), { products: sortedProducts });
                });
                return [2 /*return*/, { stores: sortedStores }];
            case 3:
                error_5 = _a.sent();
                console.error('Error in getStoresByProductId:', error_5);
                throw error_5;
            case 4: return [2 /*return*/];
        }
    });
}); };
