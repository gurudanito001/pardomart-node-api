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
exports.deleteCategory = exports.updateCategory = exports.getAllCategories = exports.getCategoryById = exports.createCategory = exports.createCategoriesBulk = void 0;
// models/category.model.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
exports.createCategoriesBulk = function (categories) { return __awaiter(void 0, void 0, Promise, function () {
    var categoryData, createdCategories;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                categoryData = categories.map(function (cat) { return ({
                    name: cat.name,
                    description: cat.description,
                    parentId: cat.parentId,
                    imageUrl: cat.imageUrl
                }); });
                return [4 /*yield*/, prisma.category.createMany({
                        data: categoryData,
                        skipDuplicates: true
                    })];
            case 1:
                _a.sent();
                return [4 /*yield*/, prisma.category.findMany({
                        where: {
                            name: {
                                "in": categories.map(function (c) { return c.name; })
                            }
                        }
                    })];
            case 2:
                createdCategories = _a.sent();
                return [2 /*return*/, createdCategories];
        }
    });
}); };
exports.createCategory = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.category.create({
                data: payload
            })];
    });
}); };
exports.getCategoryById = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.category.findUnique({
                where: { id: id },
                include: {
                    products: true
                }
            })];
    });
}); };
exports.getAllCategories = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.category.findMany({
                where: __assign(__assign(__assign(__assign(__assign({}, ((filters === null || filters === void 0 ? void 0 : filters.parentId) && { parentId: filters === null || filters === void 0 ? void 0 : filters.parentId })), (((filters === null || filters === void 0 ? void 0 : filters.type) === "top" && !(filters === null || filters === void 0 ? void 0 : filters.parentId)) && { parentId: null })), (((filters === null || filters === void 0 ? void 0 : filters.type) === "sub" && !(filters === null || filters === void 0 ? void 0 : filters.parentId)) && { parentId: { not: null } })), (filters === null || filters === void 0 ? void 0 : filters.name) && {
                    name: {
                        contains: filters === null || filters === void 0 ? void 0 : filters.name,
                        mode: 'insensitive'
                    }
                }), ((filters === null || filters === void 0 ? void 0 : filters.vendorId) && {
                    vendorProducts: {
                        some: {
                            vendorId: filters.vendorId
                        }
                    }
                }))
            })];
    });
}); };
exports.updateCategory = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.category.update({
                where: { id: payload.id },
                data: payload,
                include: {
                    products: true
                }
            })];
    });
}); };
exports.deleteCategory = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.category["delete"]({
                where: { id: id }
            })];
    });
}); };
