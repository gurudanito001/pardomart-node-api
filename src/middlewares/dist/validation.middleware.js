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
exports.validateCreateOrUpdateVendorOpeningHours = exports.validateCreateVendor = exports.validateVerifyAndLogin = exports.validateResendVerification = exports.validateLogin = exports.validateRegisterUser = exports.validate = void 0;
var express_validator_1 = require("express-validator");
var client_1 = require("@prisma/client");
// Generic validation middleware
exports.validate = function (validations) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(validations.map(function (validation) { return validation.run(req); }))];
                case 1:
                    _a.sent();
                    errors = express_validator_1.validationResult(req);
                    if (errors.isEmpty()) {
                        return [2 /*return*/, next()];
                    }
                    res.status(400).json({ errors: errors.array() });
                    return [2 /*return*/];
            }
        });
    }); };
};
// Example validation chains for specific endpoints
exports.validateRegisterUser = [
    express_validator_1.check('name').notEmpty().withMessage('Name is required'),
    express_validator_1.check('email').isEmail().withMessage('Invalid email format'),
    express_validator_1.check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
    express_validator_1.check('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['customer', 'vendor', 'delivery', 'admin'])
        .withMessage('Role must be one of: customer, vendor, delivery, or admin'),
];
exports.validateLogin = [
    express_validator_1.check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
    express_validator_1.check('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['customer', 'vendor', 'delivery', 'admin'])
        .withMessage('Role must be one of: customer, vendor, delivery, or admin'),
];
exports.validateResendVerification = [
    express_validator_1.check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
];
exports.validateVerifyAndLogin = [
    express_validator_1.check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
    express_validator_1.check('verificationCode').notEmpty().withMessage('Verification code is required'),
    express_validator_1.check('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['customer', 'vendor', 'delivery', 'admin'])
        .withMessage('Role must be one of: customer, vendor, delivery, or admin'),
];
exports.validateCreateVendor = [
    //body('userId').notEmpty().withMessage('User ID is required'),
    express_validator_1.body('name').notEmpty().withMessage('Name is required'),
    express_validator_1.body('email').optional().isEmail().withMessage('Invalid email format'),
    express_validator_1.body('tagline').optional().isString().withMessage('Tagline must be a string'),
    express_validator_1.body('details').optional().isString().withMessage('Details must be a string'),
    express_validator_1.body('image').optional().isString().withMessage('Image must be a string'),
    express_validator_1.body('address').optional().isString().withMessage('Address must be a string'),
    express_validator_1.body('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
    express_validator_1.body('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
    express_validator_1.body('meta').optional().isObject().withMessage('Meta must be an object'),
    express_validator_1.body('categories').optional().isArray().withMessage('Categories must be an array'),
];
exports.validateCreateOrUpdateVendorOpeningHours = [
    express_validator_1.body('vendorId').notEmpty().withMessage('Vendor ID is required'),
    express_validator_1.body('day')
        .notEmpty()
        .withMessage('Day is required')
        .isIn(Object.values(client_1.Days))
        .withMessage("Day must be one of: " + Object.values(client_1.Days).join(', ')),
    express_validator_1.body('open')
        .optional()
        .custom(function (value) {
        if (value === null || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            return true;
        }
        throw new Error('Open time must be in HH:MM format or null');
    }),
    express_validator_1.body('close')
        .optional()
        .custom(function (value) {
        if (value === null || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            return true;
        }
        throw new Error('Close time must be in HH:MM format or null');
    }),
    express_validator_1.body('id').optional().isUUID().withMessage('Id must be a valid UUID'),
];
// Add more validation chains as needed
