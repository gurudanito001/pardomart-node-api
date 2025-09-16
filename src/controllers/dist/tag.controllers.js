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
exports.__esModule = true;
exports.deleteTag = exports.updateTag = exports.getAllTags = exports.getTagById = exports.createTagsBulk = exports.createTag = void 0;
var tagService = require("../services/tag.service");
/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagPayload'
 *     responses:
 *       201:
 *         description: The created tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "organic"
 *     CreateTagPayload:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name for the new tag.
 *           example: "gluten-free"
 *     CreateTagsBulkPayload:
 *       type: object
 *       required:
 *         - names
 *       properties:
 *         names:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of names for the tags to be created.
 *           example: ["organic", "local", "fresh"]
 *     UpdateTagPayload:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The new name for the tag.
 *           example: "vegan"
 */
exports.createTag = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tag, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagService.createTag(req.body.name)];
            case 1:
                tag = _a.sent();
                res.status(201).json(tag);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error creating tag:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /tags/bulk:
 *   post:
 *     summary: Create multiple tags in bulk
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagsBulkPayload'
 *     responses:
 *       201:
 *         description: The created tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Bad request, names array is missing or empty.
 */
exports.createTagsBulk = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var names, tags, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                names = req.body.names;
                if (!names || !Array.isArray(names) || names.length === 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'Names array is required and must not be empty' })];
                }
                return [4 /*yield*/, tagService.createTagsBulk(names)];
            case 1:
                tags = _a.sent();
                res.status(201).json(tags);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error creating tags in bulk:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Get a tag by its ID
 *     tags: [Tag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the tag.
 *     responses:
 *       200:
 *         description: The requested tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found.
 */
exports.getTagById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tag, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagService.getTagById(req.params.id)];
            case 1:
                tag = _a.sent();
                if (!tag) {
                    return [2 /*return*/, res.status(404).json({ error: 'Tag not found' })];
                }
                res.json(tag);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error getting tag by ID:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags, with optional filtering by name
 *     tags: [Tag]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter tags by name (case-insensitive search).
 *     responses:
 *       200:
 *         description: A list of tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 */
exports.getAllTags = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name, tags, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                name = (req === null || req === void 0 ? void 0 : req.query).name;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, tagService.getAllTags({ name: name })];
            case 2:
                tags = _a.sent();
                res.json(tags);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error('Error getting all tags:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /tags/{id}:
 *   patch:
 *     summary: Update a tag's name
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the tag to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTagPayload'
 *     responses:
 *       200:
 *         description: The updated tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found.
 */
exports.updateTag = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tag, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagService.updateTag(req.params.id, req.body.name)];
            case 1:
                tag = _a.sent();
                res.json(tag);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error updating tag:', error_5);
                if ((error_5 === null || error_5 === void 0 ? void 0 : error_5.code) === 'P2025') { // Prisma's error code for record not found on update
                    return [2 /*return*/, res.status(404).json({ error: 'Tag not found' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the tag to delete.
 *     responses:
 *       200:
 *         description: The deleted tag.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found.
 */
exports.deleteTag = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tag, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagService.deleteTag(req.params.id)];
            case 1:
                tag = _a.sent();
                res.json(tag);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error deleting tag:', error_6);
                if ((error_6 === null || error_6 === void 0 ? void 0 : error_6.code) === 'P2025') { // Prisma's error code for record not found on delete
                    return [2 /*return*/, res.status(404).json({ error: 'Tag not found' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
