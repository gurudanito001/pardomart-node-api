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
exports.uploadFile = void 0;
var mediaService = require("../services/media.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload a media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Uploads a file (image, document, etc.) to the server.
 *       The file is stored on Cloudinary, and a corresponding record is created in the database.
 *       This endpoint requires a `multipart/form-data` request.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, referenceId, referenceType]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *               referenceId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the resource this media is associated with (e.g., a user ID, product ID).
 *               referenceType:
 *                 type: string
 *                 description: The type of resource the media is associated with.
 *                 enum: [bug_report_image, user_image, store_image, product_image, category_image, document, other]
 *     responses:
 *       201:
 *         description: File uploaded successfully. Returns the created media record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/Media'
 *       400:
 *         description: Bad request (e.g., no file uploaded, missing referenceId or referenceType).
 *       500:
 *         description: Internal server error.
 */
exports.uploadFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, referenceId, referenceType, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                if (!req.file) {
                    return [2 /*return*/, res.status(400).json({ message: 'No file uploaded.' })];
                }
                _a = req.body, referenceId = _a.referenceId, referenceType = _a.referenceType;
                if (!referenceId || !referenceType) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ message: 'referenceId and referenceType are required.' })];
                }
                // Validate that referenceType is a valid enum value
                if (!Object.values(client_1.ReferenceType).includes(referenceType)) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Invalid referenceType. Must be one of: " + Object.values(client_1.ReferenceType).join(', ')
                        })];
                }
                return [4 /*yield*/, mediaService.uploadMedia(req.file, referenceId, referenceType)];
            case 1:
                result = _b.sent();
                res.status(201).json({ message: 'File uploaded successfully', data: result.dbRecord });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res.status(500).json({ message: 'Error uploading file', error: error_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
