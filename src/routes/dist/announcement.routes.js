"use strict";
exports.__esModule = true;
var express_1 = require("express");
var announcementController = require("../controllers/announcement.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
// Adjust the path below to match where your multer 'upload' middleware is exported
var upload_middleware_1 = require("../middlewares/upload.middleware");
var router = express_1.Router();
router.use(auth_middleware_1.authenticate);
// Public/User routes
router.get('/', announcementController.getAnnouncementsController);
// Admin routes
router.post('/', auth_middleware_1.authorize([client_1.Role.admin]), upload_middleware_1.upload.single('image'), announcementController.createAnnouncementController);
router.patch('/:id', auth_middleware_1.authorize([client_1.Role.admin]), upload_middleware_1.upload.single('image'), announcementController.updateAnnouncementController);
router["delete"]('/:id', auth_middleware_1.authorize([client_1.Role.admin]), announcementController.deleteAnnouncementController);
router.post('/:id/broadcast', auth_middleware_1.authorize([client_1.Role.admin]), announcementController.broadcastAnnouncementController);
exports["default"] = router;
