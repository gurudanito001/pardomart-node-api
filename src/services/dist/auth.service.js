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
exports.checkUserExistence = exports.verifyCodeAndLogin = exports.storeVerificationCode = exports.findUserForLogin = exports.AuthError = void 0;
var client_1 = require("@prisma/client");
var jsonwebtoken_1 = require("jsonwebtoken");
var prisma = new client_1.PrismaClient();
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
/**
 * Finds a user for login initiation. If the role is 'vendor', it searches across
 * 'vendor', 'store_admin', and 'store_shopper' roles.
 * @param mobileNumber The user's mobile number.
 * @param role The role provided at login.
 * @returns The user object if found, otherwise null.
 */
exports.findUserForLogin = function (mobileNumber, role) { return __awaiter(void 0, void 0, Promise, function () {
    var rolesToSearch;
    return __generator(this, function (_a) {
        rolesToSearch = [role];
        // If the user is trying to log in through the generic "vendor" flow,
        // check all possible vendor-related roles.
        if (role === client_1.Role.vendor) {
            rolesToSearch = [client_1.Role.vendor, client_1.Role.store_admin, client_1.Role.store_shopper];
        }
        return [2 /*return*/, prisma.user.findFirst({
                where: {
                    mobileNumber: mobileNumber,
                    role: {
                        "in": rolesToSearch
                    }
                }
            })];
    });
}); };
/**
 * Stores a verification code for a mobile number.
 * @param mobileNumber The mobile number.
 * @param code The verification code.
 */
exports.storeVerificationCode = function (mobileNumber, code) { return __awaiter(void 0, void 0, Promise, function () {
    var expiresAt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                return [4 /*yield*/, prisma.verification.upsert({
                        where: { mobileNumber: mobileNumber },
                        create: { mobileNumber: mobileNumber, code: code, expiresAt: expiresAt, attempts: 0 },
                        update: { code: code, expiresAt: expiresAt, attempts: 0 }
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Verifies the login code and returns the user with a JWT.
 * @param mobileNumber The user's mobile number.
 * @param verificationCode The code to verify.
 * @param role The user's specific role.
 * @returns The user object and a JWT token.
 */
exports.verifyCodeAndLogin = function (mobileNumber, verificationCode, role) { return __awaiter(void 0, void 0, void 0, function () {
    var verification, user, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.verification.findUnique({
                    where: { mobileNumber: mobileNumber }
                })];
            case 1:
                verification = _a.sent();
                if (!verification || verification.code !== verificationCode) {
                    throw new AuthError('Invalid verification code.');
                }
                if (new Date() > verification.expiresAt) {
                    throw new AuthError('Verification code has expired.');
                }
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { mobileNumber_role: { mobileNumber: mobileNumber, role: role } },
                        include: {
                            vendor: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    })];
            case 2:
                user = _a.sent();
                if (!user) {
                    throw new AuthError('User not found for the specified role.');
                }
                // Invalidate the code after successful verification
                return [4 /*yield*/, prisma.verification["delete"]({ where: { mobileNumber: mobileNumber } })];
            case 3:
                // Invalidate the code after successful verification
                _a.sent();
                token = jsonwebtoken_1["default"].sign({
                    userId: user.id,
                    role: user.role,
                    vendorId: user.vendorId
                }, process.env.SECRET, { expiresIn: '30d' });
                return [2 /*return*/, { user: user, token: token }];
        }
    });
}); };
// This function is now replaced by findUserForLogin
exports.checkUserExistence = function (params) { return __awaiter(void 0, void 0, Promise, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.findUserForLogin(params.mobileNumber, params.role)];
            case 1:
                user = _a.sent();
                return [2 /*return*/, !!user];
        }
    });
}); };
