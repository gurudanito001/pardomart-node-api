"use strict";
exports.__esModule = true;
var express_1 = require("express");
var multer_1 = require("multer");
var mediaController = require("../controllers/media.controller");
var router = express_1.Router();
// Use memory storage to handle the file as a buffer
var storage = multer_1["default"].memoryStorage();
var upload = multer_1["default"]({ storage: storage });
router.post('/upload', upload.single('file'), mediaController.uploadFile);
exports["default"] = router;
