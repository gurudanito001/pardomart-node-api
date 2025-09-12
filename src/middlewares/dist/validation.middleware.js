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
exports.validateUpdateTip = exports.validateGetDeliverySlots = exports.validateDeclineOrder = exports.validateVendorOrderAction = exports.validateGetVendorOrders = exports.validateUpdateOrder = exports.validateUpdateOrderStatus = exports.validateGetOrDeleteOrder = exports.validateCreateOrder = exports.validateGetOrDeleteDeliveryAddress = exports.validateUpdateDeliveryAddress = exports.validateCreateDeliveryAddress = exports.validateGetAllCategories = exports.validateGetOrDeleteCategory = exports.validateUpdateCategory = exports.validateCreateCategoriesBulk = exports.validateCreateCategory = exports.validateCreateOrUpdateVendorOpeningHours = exports.validateCreateVendor = exports.validateVerifyAndLogin = exports.validateLogin = exports.validateRegisterUser = exports.validate = void 0;
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
    express_validator_1.body('name').trim().notEmpty().withMessage('Name is required.'),
    express_validator_1.body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
    express_validator_1.body('mobileNumber').isMobilePhone('any', { strictMode: true }).withMessage('A valid E.164 mobile number is required (e.g., +1234567890).'),
    express_validator_1.body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(Object.values(client_1.Role))
        .withMessage("Role must be one of: " + Object.values(client_1.Role).join(', ')),
    express_validator_1.body('vendorId')["if"](express_validator_1.body('role').equals(client_1.Role.vendor_staff))
        .isUUID(4).withMessage('A valid vendorId is required for vendor_staff role.'),
];
exports.validateLogin = [
    express_validator_1.body('mobileNumber').isMobilePhone('any', { strictMode: true }).withMessage('A valid E.164 mobile number is required (e.g., +1234567890).'),
    express_validator_1.body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(Object.values(client_1.Role))
        .withMessage("Role must be one of: " + Object.values(client_1.Role).join(', ')),
];
exports.validateVerifyAndLogin = [
    express_validator_1.body('mobileNumber').isMobilePhone('any', { strictMode: true }).withMessage('A valid E.164 mobile number is required (e.g., +1234567890).'),
    express_validator_1.body('verificationCode').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits.').isNumeric().withMessage('Verification code must be numeric.'),
    express_validator_1.body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(Object.values(client_1.Role))
        .withMessage("Role must be one of: " + Object.values(client_1.Role).join(', ')),
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
exports.validateCreateCategory = [
    express_validator_1.body('name').trim().notEmpty().withMessage('Category name is required.'),
    express_validator_1.body('description').optional().isString(),
    express_validator_1.body('parentId').optional({ nullable: true }).isUUID(4).withMessage('Parent ID must be a valid UUID.'),
];
exports.validateCreateCategoriesBulk = [
    express_validator_1.body('categories').isArray({ min: 1 }).withMessage('Categories must be a non-empty array.'),
    express_validator_1.body('categories.*.name').trim().notEmpty().withMessage('Each category must have a name.'),
    express_validator_1.body('categories.*.description').optional().isString(),
    express_validator_1.body('categories.*.parentId').optional({ nullable: true }).isUUID(4).withMessage('Each parent ID must be a valid UUID.'),
];
exports.validateUpdateCategory = [
    express_validator_1.param('id').isUUID(4).withMessage('Category ID must be a valid UUID.'),
    express_validator_1.body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty.'),
    express_validator_1.body('description').optional().isString(),
    express_validator_1.body('parentId').optional({ nullable: true }).isUUID(4).withMessage('Parent ID must be a valid UUID.'),
];
exports.validateGetOrDeleteCategory = [
    express_validator_1.param('id').isUUID(4).withMessage('Category ID must be a valid UUID.'),
];
exports.validateGetAllCategories = [
    express_validator_1.query('parentId').optional().isUUID(4).withMessage('Parent ID must be a valid UUID.'),
    express_validator_1.query('vendorId').optional().isUUID(4).withMessage('Vendor ID must be a valid UUID.'),
    express_validator_1.query('type').optional().isIn(['top', 'sub']).withMessage('Type must be either "top" or "sub".'),
    express_validator_1.query('name').optional().isString(),
];
exports.validateCreateDeliveryAddress = [
    express_validator_1.body('label').optional({ nullable: true }).trim().isString().withMessage('Label must be a string.'),
    express_validator_1.body('addressLine1').trim().notEmpty().withMessage('addressLine1 is required.'),
    express_validator_1.body('addressLine2').optional({ nullable: true }).trim().isString(),
    express_validator_1.body('city').trim().notEmpty().withMessage('City is required.'),
    express_validator_1.body('state').optional({ nullable: true }).trim().isString(),
    express_validator_1.body('postalCode').optional({ nullable: true }).trim().isString(),
    express_validator_1.body('country').optional().trim().isString(),
    express_validator_1.body('latitude').optional({ nullable: true }).isFloat().withMessage('Latitude must be a valid number.'),
    express_validator_1.body('longitude').optional({ nullable: true }).isFloat().withMessage('Longitude must be a valid number.'),
    express_validator_1.body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean.'),
];
exports.validateUpdateDeliveryAddress = __spreadArrays([
    express_validator_1.param('id').isUUID(4).withMessage('A valid address ID is required in the URL.'),
    express_validator_1.body('label').optional({ nullable: true }).trim().isString().withMessage('Label must be a string.'),
    express_validator_1.body('addressLine1').optional().trim().notEmpty().withMessage('addressLine1 cannot be empty if provided.'),
    express_validator_1.body('addressLine2').optional({ nullable: true }).trim().isString(),
    express_validator_1.body('city').optional().trim().notEmpty().withMessage('City cannot be empty if provided.')
], exports.validateCreateDeliveryAddress.slice(4));
exports.validateGetOrDeleteDeliveryAddress = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid address ID is required in the URL.'),
];
exports.validateCreateOrder = [
    express_validator_1.body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
    express_validator_1.body('paymentMethod').isIn(Object.values(client_1.PaymentMethods)).withMessage("paymentMethod must be one of: " + Object.values(client_1.PaymentMethods).join(', ')),
    express_validator_1.body('shippingAddressId')["if"](express_validator_1.body('deliveryMethod').equals(client_1.DeliveryMethod.delivery_person))
        .notEmpty().withMessage('shippingAddressId is required for delivery orders.')
        .isUUID(4).withMessage('shippingAddressId must be a valid UUID.'),
    express_validator_1.body('deliveryInstructions').optional().isString().isLength({ max: 500 }).withMessage('Delivery instructions cannot exceed 500 characters.'),
    express_validator_1.body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item.'),
    express_validator_1.body('orderItems.*.vendorProductId').isUUID(4).withMessage('Each order item must have a valid vendorProductId.'),
    express_validator_1.body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be a positive integer.'),
    express_validator_1.body('orderItems.*.instructions').optional().isString().isLength({ max: 500 }).withMessage('Item instructions cannot exceed 500 characters.'),
    express_validator_1.body('orderItems.*.replacementIds').optional().isArray({ max: 10 }).withMessage('A maximum of 10 replacement IDs are allowed.'),
    express_validator_1.body('orderItems.*.replacementIds.*').isUUID(4).withMessage('Each replacementId must be a valid UUID.'),
    express_validator_1.body('shoppingMethod').isIn(Object.values(client_1.ShoppingMethod)).withMessage("shoppingMethod must be one of: " + Object.values(client_1.ShoppingMethod).join(', ')),
    express_validator_1.body('deliveryMethod').isIn(Object.values(client_1.DeliveryMethod)).withMessage("deliveryMethod must be one of: " + Object.values(client_1.DeliveryMethod).join(', ')),
    express_validator_1.body('scheduledDeliveryTime').optional({ nullable: true }).isISO8601().withMessage('scheduledDeliveryTime must be a valid ISO 8601 date.'),
    express_validator_1.body('shopperTip').optional().isFloat({ min: 0 }).withMessage('shopperTip must be a non-negative number.'),
    express_validator_1.body('deliveryPersonTip').optional().isFloat({ min: 0 }).withMessage('deliveryPersonTip must be a non-negative number.'),
];
exports.validateGetOrDeleteOrder = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid order ID is required in the URL.'),
];
exports.validateUpdateOrderStatus = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid order ID is required in the URL.'),
    express_validator_1.body('status').isIn(Object.values(client_1.OrderStatus)).withMessage("Status must be one of: " + Object.values(client_1.OrderStatus).join(', ')),
];
exports.validateUpdateOrder = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid order ID is required in the URL.'),
    express_validator_1.body().custom(function (value, _a) {
        var req = _a.req;
        if (Object.keys(req.body).length === 0) {
            throw new Error('At least one field must be provided for update.');
        }
        return true;
    }),
    express_validator_1.body('paymentMethod').optional().isIn(Object.values(client_1.PaymentMethods)).withMessage("paymentMethod must be one of: " + Object.values(client_1.PaymentMethods).join(', ')),
    express_validator_1.body('paymentStatus').optional().isIn(Object.values(client_1.PaymentStatus)).withMessage("paymentStatus must be one of: " + Object.values(client_1.PaymentStatus).join(', ')),
    express_validator_1.body('orderStatus').optional().isIn(Object.values(client_1.OrderStatus)).withMessage("orderStatus must be one of: " + Object.values(client_1.OrderStatus).join(', ')),
    express_validator_1.body('deliveryAddressId').optional({ nullable: true }).isUUID(4).withMessage('deliveryAddressId must be a valid UUID.'),
];
exports.validateGetVendorOrders = [
    express_validator_1.query('status').optional().isIn(Object.values(client_1.OrderStatus)).withMessage("Status must be one of: " + Object.values(client_1.OrderStatus).join(', ')),
];
exports.validateVendorOrderAction = [
    express_validator_1.param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
];
exports.validateDeclineOrder = [
    express_validator_1.param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
    express_validator_1.body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters.'),
];
exports.validateGetDeliverySlots = [
    express_validator_1.query('vendorId').notEmpty().withMessage('vendorId is required.').isUUID(4).withMessage('vendorId must be a valid UUID.'),
    express_validator_1.query('deliveryMethod').notEmpty().withMessage('deliveryMethod is required.').isIn(Object.values(client_1.DeliveryMethod)).withMessage("deliveryMethod must be one of: " + Object.values(client_1.DeliveryMethod).join(', ')),
];
exports.validateUpdateTip = [
    express_validator_1.param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
    express_validator_1.body('shopperTip').optional().isFloat({ min: 0 }).withMessage('shopperTip must be a non-negative number.'),
    express_validator_1.body('deliveryPersonTip').optional().isFloat({ min: 0 }).withMessage('deliveryPersonTip must be a non-negative number.'),
    express_validator_1.body().custom(function (value, _a) {
        var req = _a.req;
        if (req.body.shopperTip === undefined && req.body.deliveryPersonTip === undefined) {
            throw new Error('At least one tip amount (shopperTip or deliveryPersonTip) must be provided.');
        }
        return true;
    }),
];
// Add more validation chains as needed
