"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.verifyCodeAndLogin = exports.storeVerificationCode = exports.checkUserExistence = exports.AuthError = void 0;
var client_1 = require("@prisma/client");
var auth_1 = require("../utils/auth");
var userModel = require("../models/user.model");
var prisma = new client_1.PrismaClient();
// Custom Error for auth flow to allow for specific error handling
var AuthError = /** @class */ (function (_super) {
    __extends(AuthError, _super);
    function AuthError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'AuthError';
        return _this;
    }
    return AuthError;
}(Error));
exports.AuthError = AuthError;
exports.checkUserExistence = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, userModel.checkUserExistence(filters)];
    });
}); };
/**
 * Stores or updates a verification code for a given mobile number.
 * @param mobileNumber The user's mobile number.
 * @param verificationCode The code to store.
 */
exports.storeVerificationCode = function (mobileNumber, verificationCode) { return __awaiter(void 0, void 0, Promise, function () {
    var expiresAt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                expiresAt = new Date(Date.now() + 5 * 60 * 1000);
                return [4 /*yield*/, prisma.verification.upsert({
                        where: { mobileNumber: mobileNumber },
                        update: { code: verificationCode, expiresAt: expiresAt, attempts: 0 },
                        create: { mobileNumber: mobileNumber, code: verificationCode, expiresAt: expiresAt }
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Verifies a mobile number with a code and returns a JWT if successful.
 * @param mobileNumber The user's mobile number.
 * @param verificationCode The code provided by the user.
 * @param role The user's role.
 * @returns An object with the token and user, or throws an AuthError.
 */
exports.verifyCodeAndLogin = function (mobileNumber, verificationCode, role) { return __awaiter(void 0, void 0, void 0, function () {
    var storedVerification;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.verification.findUnique({
                    where: { mobileNumber: mobileNumber }
                })];
            case 1:
                storedVerification = _a.sent();
                if (!storedVerification) {
                    throw new AuthError('No verification code found for this number. Please request a new one.');
                }
                if (!(storedVerification.expiresAt < new Date())) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.verification["delete"]({ where: { mobileNumber: mobileNumber } })];
            case 2:
                _a.sent();
                throw new AuthError('Verification code has expired.');
            case 3:
                if ((storedVerification === null || storedVerification === void 0 ? void 0 : storedVerification.attempts) && storedVerification.attempts >= 5) {
                    throw new AuthError('Too many incorrect attempts. Please request a new code.');
                }
                if (!(storedVerification.code !== verificationCode)) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.verification.update({
                        where: { mobileNumber: mobileNumber },
                        data: { attempts: { increment: 1 } }
                    })];
            case 4:
                _a.sent();
                throw new AuthError('Invalid verification code.');
            case 5: 
            // Use a transaction to ensure logging in and cleaning up the code are atomic
            return [2 /*return*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                    var user, updatedUser, token;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, tx.user.findFirst({ where: { mobileNumber: mobileNumber, role: role } })];
                            case 1:
                                user = _a.sent();
                                if (!user)
                                    throw new AuthError('User not found.');
                                return [4 /*yield*/, tx.user.update({ where: { id: user.id }, data: { mobileVerified: true } })];
                            case 2:
                                updatedUser = _a.sent();
                                token = auth_1.generateToken(user.id, user.role);
                                return [4 /*yield*/, tx.verification["delete"]({ where: { mobileNumber: mobileNumber } })];
                            case 3:
                                _a.sent();
                                return [2 /*return*/, { token: token, user: updatedUser }];
                        }
                    });
                }); })];
        }
    });
}); };
