"use strict";
exports.__esModule = true;
exports.authorize = exports.authorizeVendorAccess = exports.authenticate = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var JWT_SECRET = process.env.SECRET;
exports.authenticate = function (req, res, next) {
    var authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        var token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication token missing' });
        }
        jsonwebtoken_1["default"].verify(token, JWT_SECRET, function (err, decoded) {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }
            var payload = decoded; // Type assertion
            req.userId = payload.userId;
            req.userRole = payload.role;
            req.vendorId = payload.vendorId;
            next(); // Proceed to the next middleware or controller
        });
    }
    else {
        return res.status(401).json({ error: 'Authentication token missing' });
    }
};
// Middleware to authorize access for vendor staff or admin roles
exports.authorizeVendorAccess = function (req, res, next) {
    var authReq = req;
    if (!authReq.userRole || (authReq.userRole !== "vendor_staff" && authReq.userRole !== "vendor")) {
        return res.status(403).json({ message: 'Forbidden: Requires vendor staff or admin role.' });
    }
    // Ensure the user is actually associated with a vendor (critical check)
    if (authReq.userRole === "vendor_staff" && !authReq.vendorId) {
        return res.status(403).json({ message: 'Forbidden: User is not associated with a vendor.' });
    }
    next();
};
// Generic role-based authorization middleware
exports.authorize = function (allowedRoles) {
    return function (req, res, next) {
        if (!req.userRole) {
            return res.status(403).json({ error: 'Forbidden: User role not available on request.' });
        }
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: "Forbidden: Requires one of the following roles: " + allowedRoles.join(', ') });
        }
        next();
    };
};
