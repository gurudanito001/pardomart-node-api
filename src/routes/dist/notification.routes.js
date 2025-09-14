"use strict";
exports.__esModule = true;
// src/routes/notification.routes.ts
var express_1 = require("express");
var notificationController = require("../controllers/notification.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1["default"].Router();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetNotifications), notificationController.getNotificationsController);
router.get('/unread-count', notificationController.getUnreadCountController);
router.patch('/:notificationId/read', validation_middleware_1.validate(validation_middleware_1.validateNotificationId), notificationController.markAsReadController);
router.patch('/read-all', notificationController.markAllAsReadController);
exports["default"] = router;
