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
exports.updateContentController = exports.getContentController = void 0;
var contentService = require("../services/content.service");
var http_status_codes_1 = require("http-status-codes");
/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Management of static content like Privacy Policy and Terms of Service
 */
/**
 * @swagger
 * /content/{type}:
 *   get:
 *     summary: Get static content by type
 *     tags: [Content]
 *     description: Retrieves the content for a given type, such as PRIVACY_POLICY. This is a public endpoint.
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ContentType'
 *         description: The type of content to retrieve.
 *     responses:
 *       200:
 *         description: The requested content.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       500:
 *         description: Internal server error.
 */
exports.getContentController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var type, content, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                type = req.params.type;
                return [4 /*yield*/, contentService.getContentService(type)];
            case 1:
                content = _a.sent();
                res.status(http_status_codes_1.StatusCodes.OK).json(content);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching content' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /content/{type}:
 *   patch:
 *     summary: Update static content by type (Admin)
 *     tags: [Content, Admin]
 *     description: Creates or updates the content for a given type. Requires admin privileges. The content should be an HTML string.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ContentType'
 *         description: The type of content to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateContentPayload'
 *     responses:
 *       200:
 *         description: The updated content.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       400:
 *         description: Bad request (validation error).
 *       500:
 *         description: Internal server error.
 */
exports.updateContentController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var type, payload, updatedContent, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                type = req.params.type;
                payload = req.body;
                return [4 /*yield*/, contentService.updateContentService(type, payload)];
            case 1:
                updatedContent = _a.sent();
                res.status(http_status_codes_1.StatusCodes.OK).json(updatedContent);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating content' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
