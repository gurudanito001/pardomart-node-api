"use strict";
exports.__esModule = true;
exports.healthCheckController = void 0;
var http_status_codes_1 = require("http-status-codes");
/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check and wake-up endpoint
 */
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: A simple endpoint to check if the API is running. Can be used by monitoring services to keep the server from sleeping on free tiers.
 *     responses:
 *       200:
 *         description: API is up and running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pardomart API is awake and running!"
 */
exports.healthCheckController = function (req, res) {
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Pardomart API is awake and running!'
    });
};
