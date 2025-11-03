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
exports.deleteCategory = exports.updateCategory = exports.getAllCategories = exports.getCategoryById = exports.createCategory = exports.createCategoriesBulk = exports.getAllSubCategoriesController = exports.getAllParentCategoriesController = exports.getCategoryOverviewController = void 0;
var categoryService = require("../services/category.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryOverview:
 *       type: object
 *       properties:
 *         totalParentCategories:
 *           type: integer
 *           description: "The total number of top-level categories."
 *         totalSubCategories:
 *           type: integer
 *           description: "The total number of categories that are children of another category."
 */
/**
 * @swagger
 * /category/admin/overview:
 *   get:
 *     summary: Get an overview of category data (Admin)
 *     tags: [Category, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves aggregate data about categories, such as the total number of parent and sub-categories.
 *     responses:
 *       200:
 *         description: The category overview data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryOverview'
 *       500:
 *         description: Internal server error.
 */
exports.getCategoryOverviewController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overview, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, categoryService.getCategoryOverviewService()];
            case 1:
                overview = _a.sent();
                res.status(200).json(overview);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error getting category overview:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category/parents:
 *   get:
 *     summary: Get all parent categories
 *     tags: [Category]
 *     description: Retrieves a list of all top-level categories (those without a parent).
 *     responses:
 *       200:
 *         description: A list of parent categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error.
 */
exports.getAllParentCategoriesController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parentCategories, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, categoryService.getAllParentCategoriesService()];
            case 1:
                parentCategories = _a.sent();
                res.status(200).json(parentCategories);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting parent categories:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category/sub-categories:
 *   get:
 *     summary: Get all sub-categories
 *     tags: [Category]
 *     description: Retrieves a list of all categories that are children of another category (i.e., their parentId is not null).
 *     responses:
 *       200:
 *         description: A list of all sub-categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error.
 */
exports.getAllSubCategoriesController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var subCategories, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, categoryService.getAllSubCategoriesService()];
            case 1:
                subCategories = _a.sent();
                res.status(200).json(subCategories);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error getting sub-categories:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category/bulk:
 *   post:
 *     summary: Create multiple categories in bulk
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoriesBulkPayload'
 *     responses:
 *       201:
 *         description: The created categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request, category list is missing or empty.
 *       500:
 *         description: Internal server error.
 */
exports.createCategoriesBulk = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categories, createdCategories, error_4, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                categories = req.body.categories;
                return [4 /*yield*/, categoryService.createCategoriesBulk(categories)];
            case 1:
                createdCategories = _a.sent();
                res.status(201).json(createdCategories);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                errorMessage = error_4 instanceof Error ? error_4.message : 'Internal server error';
                console.error('Error creating categories in bulk:', error_4);
                res.status(500).json({ error: errorMessage });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category (Admin)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new category. To create a parent category, omit the `parentId`. To create a sub-category, provide the `parentId` of an existing category.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryPayload'
 *     responses:
 *       201:
 *         description: The created category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Not Found - The provided parentId does not exist.
 *       409:
 *         description: Conflict - A category with this name already exists.
 *       500:
 *         description: Internal server error.
 */
exports.createCategory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, error_5, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, categoryService.createCategory(req.body)];
            case 1:
                category = _a.sent();
                res.status(201).json(category);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                if (error_5 instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    // Handle unique constraint violation (e.g., duplicate category name)
                    if (error_5.code === 'P2002') {
                        return [2 /*return*/, res.status(409).json({ error: 'A category with this name already exists.' })];
                    }
                    if (error_5.code === 'P2003') {
                        return [2 /*return*/, res.status(404).json({ error: 'The specified parent category does not exist.' })];
                    }
                }
                errorMessage = error_5.message || 'Internal server error';
                console.error('Error creating category:', error_5);
                res.status(500).json({ error: errorMessage });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Get a category by its ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category.
 *     responses:
 *       200:
 *         description: The requested category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found.
 */
exports.getCategoryById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, error_6, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, categoryService.getCategoryById(req.params.id)];
            case 1:
                category = _a.sent();
                if (!category) {
                    return [2 /*return*/, res.status(404).json({ error: 'Category not found' })];
                }
                res.json(category);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                errorMessage = error_6 instanceof Error ? error_6.message : 'Internal server error';
                console.error('Error getting category by ID:', error_6);
                res.status(500).json({ error: errorMessage });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories, with optional filters
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter categories by their parent ID.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [top, sub]
 *         description: Filter categories by their type.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter categories by name (case-insensitive search).
 *     responses:
 *       200:
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
exports.getAllCategories = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, parentId, type, name, categories, error_7, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req === null || req === void 0 ? void 0 : req.query, parentId = _a.parentId, type = _a.type, name = _a.name;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, categoryService.getAllCategories({ parentId: parentId, type: type, name: name })];
            case 2:
                categories = _b.sent();
                res.json(categories);
                return [3 /*break*/, 4];
            case 3:
                error_7 = _b.sent();
                errorMessage = error_7 instanceof Error ? error_7.message : 'Internal server error';
                console.error('Error getting all categories:', error_7);
                res.status(500).json({ error: errorMessage });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update a category (Admin)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Updates a category's details. This can be used to change its name, description, or move it within the hierarchy.
 *       - To change a sub-category's parent, provide a new `parentId`.
 *       - To promote a sub-category to a parent category, set `parentId` to `null`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryPayload'
 *     responses:
 *       200:
 *         description: The updated category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found.
 */
exports.updateCategory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, categoryService.updateCategory(__assign({ id: req.params.id }, req.body))];
            case 1:
                category = _a.sent();
                res.json(category);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                if (error_8 instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error_8.code === 'P2025') {
                        return [2 /*return*/, res.status(404).json({ error: 'Category not found.' })];
                    }
                    // Handle unique constraint violation on update
                    if (error_8.code === 'P2002') {
                        return [2 /*return*/, res.status(409).json({ error: 'A category with this name already exists.' })];
                    }
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to delete.
 *     responses:
 *       200:
 *         description: The deleted category.
 *       404:
 *         description: Category not found.
 */
exports.deleteCategory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, categoryService.deleteCategory(req.params.id)];
            case 1:
                category = _a.sent();
                res.json(category);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                if (error_9 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_9.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Category not found.' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
