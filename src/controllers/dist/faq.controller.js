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
exports.deleteFaqController = exports.updateFaqController = exports.createFaqController = exports.getAllFaqsController = void 0;
var faqService = require("../services/faq.service");
var http_status_codes_1 = require("http-status-codes");
/**
 * @swagger
 * tags:
 *   name: FAQ
 *   description: Frequently Asked Questions management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Faq:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *         isActive:
 *           type: boolean
 *         sortOrder:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateFaqPayload:
 *       type: object
 *       required: [question, answer]
 *       properties:
 *         question: { type: string, example: "How do I track my order?" }
 *         answer: { type: string, example: "You can track your order from the 'My Orders' section." }
 *         isActive: { type: boolean, default: true }
 *         sortOrder: { type: integer, default: 0 }
 *     UpdateFaqPayload:
 *       type: object
 *       properties:
 *         question: { type: string }
 *         answer: { type: string }
 *         isActive: { type: boolean }
 *         sortOrder: { type: integer }
 */
/**
 * @desc Get all active FAQs
 * @route GET /api/v1/faqs
 * @access Public
 * @swagger
 * /api/v1/faqs:
 *   get:
 *     summary: Get all active FAQs
 *     tags: [FAQ]
 *     parameters:
 *       - in: query
 *         name: question
 *         schema:
 *           type: string
 *         description: "Filter FAQs by a search term in the question (case-insensitive)."
 *       - in: query
 *         name: answer
 *         schema:
 *           type: string
 *         description: "Filter FAQs by a search term in the answer (case-insensitive)."
 *     responses:
 *       200:
 *         description: A list of active FAQs, ordered by sortOrder.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Faq' }
 *       500:
 *         description: Internal server error.
 */
exports.getAllFaqsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, question, answer, filters, faqs, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, question = _a.question, answer = _a.answer;
                filters = {
                    question: question,
                    answer: answer
                };
                return [4 /*yield*/, faqService.getAllFaqsService(filters)];
            case 1:
                faqs = _b.sent();
                res.status(http_status_codes_1.StatusCodes.OK).json(faqs);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res
                    .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error fetching FAQs' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @desc Create a new FAQ
 * @route POST /api/v1/faqs
 * @access Admin
 * @swagger
 * /api/v1/faqs:
 *   post:
 *     summary: Create a new FAQ (Admin)
 *     tags: [FAQ, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFaqPayload'
 *     responses:
 *       201:
 *         description: The created FAQ.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Bad request (validation error).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
exports.createFaqController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, newFaq, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                payload = req.body;
                return [4 /*yield*/, faqService.createFaqService(payload)];
            case 1:
                newFaq = _a.sent();
                res.status(http_status_codes_1.StatusCodes.CREATED).json(newFaq);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res
                    .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error creating FAQ' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @desc Update an FAQ
 * @route PATCH /api/v1/faqs/:id
 * @access Admin
 * @swagger
 * /api/v1/faqs/{id}:
 *   patch:
 *     summary: Update an FAQ (Admin)
 *     tags: [FAQ, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: The ID of the FAQ to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFaqPayload'
 *     responses:
 *       200:
 *         description: The updated FAQ.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Bad request (validation error).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: FAQ not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateFaqController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, payload, updatedFaq, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                payload = req.body;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, faqService.updateFaqService(id, payload)];
            case 2:
                updatedFaq = _a.sent();
                res.status(http_status_codes_1.StatusCodes.OK).json(updatedFaq);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                if (error_3.message === 'FAQ not found') {
                    return [2 /*return*/, res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: error_3.message })];
                }
                res
                    .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error updating FAQ' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @desc Delete an FAQ
 * @route DELETE /api/v1/faqs/:id
 * @access Admin
 * @swagger
 * /api/v1/faqs/{id}:
 *   delete:
 *     summary: Delete an FAQ (Admin)
 *     tags: [FAQ, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: The ID of the FAQ to delete.
 *     responses:
 *       204:
 *         description: FAQ deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: FAQ not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteFaqController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, faqService.deleteFaqService(id)];
            case 2:
                _a.sent();
                res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                if (error_4.message === 'FAQ not found') {
                    return [2 /*return*/, res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: error_4.message })];
                }
                res
                    .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error deleting FAQ' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
