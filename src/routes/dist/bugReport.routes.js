"use strict";
exports.__esModule = true;
var express_1 = require("express");
var bugReport_controller_1 = require("../controllers/bugReport.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var upload_middleware_1 = require("../middlewares/upload.middleware");
var client_1 = require("@prisma/client");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1.Router();
/**
 * @swagger
 * tags:
 *   name: BugReport
 *   description: Bug reporting
 */
/**
 * @swagger
 * /bug-reports:
 *   post:
 *     summary: Report a bug
 *     tags: [BugReport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description:
 *                 type: string
 *                 description: A description of the bug.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: (Optional) An image of the bug.
 *     responses:
 *       201:
 *         description: Bug report created successfully.
 */
router.post('/', auth_middleware_1.authenticate, upload_middleware_1.upload.single('image'), bugReport_controller_1.createBugReportController);
/**
 * @swagger
 * /bug-reports/{id}/status:
 *   patch:
 *     summary: Update a bug report's status (Admin only)
 *     tags: [BugReport, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: The ID of the bug report to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isResolved]
 *             properties:
 *               isResolved:
 *                 type: boolean
 *                 description: Set to true to mark the bug as resolved, false to mark it as unresolved.
 *     responses:
 *       200:
 *         description: Bug report status updated successfully.
 */
router.patch('/:id/status', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.admin]), validation_middleware_1.validate(validation_middleware_1.validateUpdateBugReportStatus), bugReport_controller_1.updateBugReportStatusController);
exports["default"] = router;
