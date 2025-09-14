"use strict";
exports.__esModule = true;
exports.unregisterDevice = exports.registerDevice = void 0;
// src/services/device.service.ts
var deviceModel = require("../models/device.model");
exports.registerDevice = function (userId, fcmToken, platform) {
    // Additional logic can go here, e.g., cleaning up old tokens for the user
    return deviceModel.upsertDevice(userId, fcmToken, platform);
};
exports.unregisterDevice = function (fcmToken) {
    return deviceModel.removeDeviceByToken(fcmToken);
};
