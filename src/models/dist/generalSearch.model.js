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
exports.vendorCategoryWithProducts = exports.searchByCategoryName = exports.searchByStoreName = exports.searchByProductName = void 0;
var client_1 = require("@prisma/client");
var geolib_1 = require("geolib"); // You'll need to install the 'geolib' package: npm install geolib
var prisma = new client_1.PrismaClient();
exports.searchByProductName = function (searchTerm, // Changed to searchTerm
userLatitude, userLongitude) { return __awaiter(void 0, void 0, Promise, function () {
    var vendorProducts, vendorProductMap_1, storesWithProducts, sortedStores, error_1;
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
                    // The 'vendor' and 'product' relations are included in the initial query but not in the base VendorProduct type.
                    // We remove them here to clean up the response payload for each product.
                    var cleanedProducts = sortedProducts.map(function (p) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        var _a = p, vendor = _a.vendor, product = _a.product, rest = __rest(_a, ["vendor", "product"]);
                        return rest;
                    });
                    return __assign(__assign({}, store), { products: cleanedProducts });
                });
                return [2 /*return*/, { stores: sortedStores }];
            case 3:
                error_1 = _a.sent();
                console.error('Error in getStoresByProductId:', error_1);
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
                    var distance = geolib_1.getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
                    return __assign(__assign({}, vendor), { distance: distance / 1000 });
                });
                // 3. Sort vendors by distance (closest first).
                vendorsWithDistance.sort(function (a, b) { return a.distance - b.distance; });
                return [4 /*yield*/, Promise.all(vendorsWithDistance.map(function (vendor) { return __awaiter(void 0, void 0, void 0, function () {
                        var products;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma.vendorProduct.findMany({
                                        where: { vendorId: vendor.id },
                                        take: 5,
                                        orderBy: { createdAt: 'desc' }
                                    })];
                                case 1:
                                    products = _a.sent();
                                    return [2 /*return*/, { vendor: vendor, products: products }];
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
    var categories, categoryIds_1, allCategoryIds, vendorsWithProducts, storesWithFormattedProducts, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
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
                allCategoryIds = Array.from(categoryIds_1);
                return [4 /*yield*/, prisma.vendor.findMany({
                        where: {
                            vendorProducts: {
                                some: {
                                    categories: {
                                        some: {
                                            id: { "in": allCategoryIds }
                                        }
                                    }
                                }
                            }
                        },
                        include: {
                            vendorProducts: {
                                where: {
                                    categories: { some: { id: { "in": allCategoryIds } } }
                                },
                                take: 5,
                                orderBy: { createdAt: 'desc' }
                            }
                        }
                    })];
            case 2:
                vendorsWithProducts = _a.sent();
                storesWithFormattedProducts = vendorsWithProducts.map(function (vendor) {
                    var distance = geolib_1.getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
                    var vendorProducts = vendor.vendorProducts, storeDetails = __rest(vendor, ["vendorProducts"]);
                    return { vendor: __assign(__assign({}, storeDetails), { distance: distance / 1000 }), products: vendorProducts };
                }).sort(function (a, b) { return a.vendor.distance - b.vendor.distance; });
                return [2 /*return*/, { stores: storesWithFormattedProducts }];
            case 3:
                error_3 = _a.sent();
                console.error('Error in searchByCategoryName:', error_3);
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.vendorCategoryWithProducts = function (vendorId, parentCategoryId) { return __awaiter(void 0, void 0, Promise, function () {
    var allCategories, childrenMap_1, getDescendantIds, baseCategories, results, _i, baseCategories_1, baseCategory, descendantIds, categoryIdsToFetch, products, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, prisma.category.findMany()];
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
                getDescendantIds = function (categoryId) {
                    var descendants = [];
                    var queue = __spreadArrays((childrenMap_1.get(categoryId) || []));
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
                error_4 = _a.sent();
                console.error('Error fetching categories with products for vendor:', error_4);
                throw error_4; // Re-throw for centralized error handling
            case 7: return [2 /*return*/];
        }
    });
}); };
/* export const searchStoreByProductName = async (
  searchTerm: string,  // Changed to searchTerm
  vendorId: string,
): Promise<VendorProduct[]> => {
  try {
    // 1. Find the VendorProducts for the given searchTerm.
    const vendorProducts = await prisma.vendorProduct.findMany({
      where: {
        product: {  // Assuming there's a relation to a Product model
          name: {
            contains: searchTerm, // Use 'contains' for searching
            mode: 'insensitive'  //  case-insensitive search
          }
        }
      },
      include: {
        vendor: true,
        product: true // Include the product in the result
      },
    });

    if (!vendorProducts || vendorProducts.length === 0) {
      return { stores: [] };
    }

    // 2.  Create a map of vendors, and vendorProducts
     const vendorProductMap = new Map<string, { vendor: Vendor & { distance?: number }; products: VendorProduct[] }>();

    // Add vendors and products to the map.  Calculate distance here.
    vendorProducts.forEach((vProduct) => {
      const distance = getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        { latitude: vProduct.vendor.latitude || 0, longitude: vProduct.vendor.longitude || 0 }
      );

      const vendorWithDistance = { ...vProduct.vendor, distance: distance / 1000 }; // Create a new object

      if (!vendorProductMap.has(vProduct.vendorId)) {
        vendorProductMap.set(vProduct.vendorId, {
          vendor: vendorWithDistance,
          products: [vProduct],
        });
      } else {
        vendorProductMap.get(vProduct.vendorId)!.products.push(vProduct);
      }
    });

    //3. Convert the map to an array
    const storesWithProducts = Array.from(vendorProductMap.values());

    //4. Fetch other products for each vendor.
    await Promise.all(
      storesWithProducts.map(async (store) => {
        const otherProducts = await prisma.vendorProduct.findMany({
          where: {
            vendorId: store.vendor.id,
            product: {
              name: {
                not: {
                  contains: searchTerm,
                },
                mode: 'insensitive' // Move mode here
              },
            },
          },
          take: 4,
        });
        store.products.push(...otherProducts);
      })
    );

    // Sort by distance (closest first)
    storesWithProducts.sort((a, b) => a.vendor.distance! - b.vendor.distance!);

    //Re-arrange the products.  The product that matches the search term should be the first.

    const sortedStores = storesWithProducts.map(store => {
        const sortedProducts = store.products.sort(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ? -1 : 1
        );

        // The 'vendor' and 'product' relations are included in the initial query but not in the base VendorProduct type.
        // We remove them here to clean up the response payload for each product.
        const cleanedProducts = sortedProducts.map(p => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { vendor, product, ...rest } = p as any;
            return rest;
        });
        return { ...store, products: cleanedProducts };
    });

    return { stores: sortedStores };
  } catch (error) {
    console.error('Error in getStoresByProductId:', error);
    throw error;
  }
}; */
