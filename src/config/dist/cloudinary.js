"use strict";
exports.__esModule = true;
var cloudinary_1 = require("cloudinary");
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
exports["default"] = cloudinary_1.v2;
