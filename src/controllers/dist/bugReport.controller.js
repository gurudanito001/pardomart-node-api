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
exports.updateBugReportStatusController = exports.createBugReportController = void 0;
var bugReportService = require("../services/bugReport.service");
var client_1 = require("@prisma/client");
var notificationService = require("../services/notification.service");
var prisma = new client_1.PrismaClient();
exports.createBugReportController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, description, imageUrl, bugReport, user, admins, _i, admins_1, admin, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 9, , 10]);
                userId = req.userId;
                description = req.body.description;
                if (!description) {
                    return [2 /*return*/, res.status(400).json({ error: 'Description is required.' })];
                }
                imageUrl = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                return [4 /*yield*/, bugReportService.createBugReportService({
                        userId: userId,
                        description: description,
                        imageUrl: imageUrl
                    })];
            case 1:
                bugReport = _b.sent();
                return [4 /*yield*/, prisma.user.findUnique({ where: { id: userId } })];
            case 2:
                user = _b.sent();
                return [4 /*yield*/, prisma.user.findMany({ where: { role: client_1.Role.admin } })];
            case 3:
                admins = _b.sent();
                _i = 0, admins_1 = admins;
                _b.label = 4;
            case 4:
                if (!(_i < admins_1.length)) return [3 /*break*/, 7];
                admin = admins_1[_i];
                return [4 /*yield*/, notificationService.createNotification({
                        userId: admin.id,
                        type: 'BUG_REPORT_RECEIVED',
                        category: client_1.NotificationCategory.SUPPORT,
                        title: 'New Bug Report',
                        body: "A new bug has been reported by " + ((user === null || user === void 0 ? void 0 : user.name) || 'a user') + ".",
                        meta: { bugReportId: bugReport.id }
                    })];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7: 
            // Notify the user that their report has been received
            return [4 /*yield*/, notificationService.createNotification({
                    userId: userId,
                    type: 'BUG_REPORT_RECEIVED',
                    category: client_1.NotificationCategory.SUPPORT,
                    title: 'New Bug Report',
                    body: "Your bug report has been received.",
                    meta: { bugReportId: bugReport.id }
                })];
            case 8:
                // Notify the user that their report has been received
                _b.sent();
                // --- End Notification Logic ---
                res.status(201).json({ message: 'Bug report submitted successfully.', bugReport: bugReport });
                return [3 /*break*/, 10];
            case 9:
                error_1 = _b.sent();
                console.error('Error creating bug report:', error_1);
                res.status(500).json({ error: 'Failed to create bug report.', message: error_1.message });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.updateBugReportStatusController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, isResolved, updatedBugReport, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                isResolved = req.body.isResolved;
                return [4 /*yield*/, bugReportService.updateBugReportStatusService(id, isResolved)];
            case 1:
                updatedBugReport = _a.sent();
                if (!updatedBugReport.isResolved) return [3 /*break*/, 3];
                return [4 /*yield*/, notificationService.createNotification({
                        userId: updatedBugReport.userId,
                        type: 'BUG_REPORT_RESOLVED',
                        title: 'Bug Report Resolved',
                        body: "Your bug report has been marked as resolved.",
                        meta: { bugReportId: updatedBugReport.id }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                // --- End Notification Logic ---
                res.status(200).json({ message: 'Bug report status updated successfully.', bugReport: updatedBugReport });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                if (error_2 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_2.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Bug report not found.' })];
                }
                if (error_2.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_2.message })];
                }
                console.error('Error updating bug report status:', error_2);
                res.status(500).json({ error: 'Failed to update bug report status.', message: error_2.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
