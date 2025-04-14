"use strict";
exports.__esModule = true;
// routes/tag.routes.ts
var express_1 = require("express");
var tagController = require("../controllers/tag.controller");
var router = express_1["default"].Router();
router.post('/', tagController.createTag);
router.post('/bulk', tagController.createTagsBulk);
router.get('/:id', tagController.getTagById);
router.get('/', tagController.getAllTags);
router.patch('/:id', tagController.updateTag);
router["delete"]('/:id', tagController.deleteTag);
exports["default"] = router;
