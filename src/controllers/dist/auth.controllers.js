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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.verifyCodeAndLogin = exports.initiateLogin = exports.resendVerificationCode = exports.getTimeZones = exports.registerUser = void 0;
var authService = require("../services/auth.service"); // Create this file
var userService = require("../services/user.service");
var verification_1 = require("../utils/verification"); // Create this file.
var timezones_1 = require("../utils/timezones");
exports.registerUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newUser, verificationCode, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, userService.createUser(req.body)];
            case 1:
                newUser = _a.sent();
                verificationCode = verification_1.generateVerificationCode();
                return [4 /*yield*/, authService.storeVerificationCode(newUser === null || newUser === void 0 ? void 0 : newUser.mobileNumber, verificationCode)];
            case 2:
                _a.sent();
                return [4 /*yield*/, verification_1.sendVerificationCode(newUser === null || newUser === void 0 ? void 0 : newUser.mobileNumber, verificationCode)];
            case 3:
                _a.sent();
                res.status(201).json({ message: 'Verification code sent' });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Error registering user:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getTimeZones = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var timezones, utcs_1;
    return __generator(this, function (_a) {
        try {
            timezones = timezones_1["default"];
            utcs_1 = [];
            timezones.forEach(function (zone) {
                utcs_1 = __spreadArrays(utcs_1, zone.utc);
            });
            res.status(201).json({ message: 'List of time zones', data: utcs_1 });
        }
        catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        return [2 /*return*/];
    });
}); };
exports.resendVerificationCode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobileNumber, role, userExists, verificationCode, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, mobileNumber = _a.mobileNumber, role = _a.role;
                return [4 /*yield*/, authService.checkUserExistence({ mobileNumber: mobileNumber, role: role })];
            case 1:
                userExists = _b.sent();
                if (!userExists) {
                    return [2 /*return*/, res.status(404).json({ error: 'User not found' })];
                }
                verificationCode = verification_1.generateVerificationCode();
                return [4 /*yield*/, authService.storeVerificationCode(mobileNumber, verificationCode)];
            case 2:
                _b.sent();
                return [4 /*yield*/, verification_1.sendVerificationCode(mobileNumber, verificationCode)];
            case 3:
                _b.sent();
                res.status(200).json({ message: 'Verification code resent' });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                console.error('Error resending verification code:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.initiateLogin = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobileNumber, role, userExists, verificationCode, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, mobileNumber = _a.mobileNumber, role = _a.role;
                return [4 /*yield*/, authService.checkUserExistence({ mobileNumber: mobileNumber, role: role })];
            case 1:
                userExists = _b.sent();
                if (!userExists) {
                    return [2 /*return*/, res.status(200).json({ exists: false })];
                }
                verificationCode = verification_1.generateVerificationCode();
                return [4 /*yield*/, authService.storeVerificationCode(mobileNumber, verificationCode)];
            case 2:
                _b.sent();
                return [4 /*yield*/, verification_1.sendVerificationCode(mobileNumber, verificationCode)];
            case 3:
                _b.sent();
                res.status(200).json({ exists: true });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _b.sent();
                console.error('Error initiating login:', error_3);
                res.status(500).json({ error: "Internal server error " + error_3 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.verifyCodeAndLogin = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobileNumber, verificationCode, role, user, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, mobileNumber = _a.mobileNumber, verificationCode = _a.verificationCode, role = _a.role;
                return [4 /*yield*/, authService.verifyCodeAndLogin(mobileNumber, verificationCode, role)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid verification' })];
                }
                // TODO: Handle error when the code has expired
                res.status(200).json(user); // user object containing token.
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                console.error('Error verifying code and logging in:', error_4);
                res.status(500).json({ error: "Internal server error " + error_4 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
