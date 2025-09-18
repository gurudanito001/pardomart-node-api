"use strict";
exports.__esModule = true;
exports.upload = void 0;
var multer_1 = require("multer");
var cloudinary_1 = require("cloudinary");
var multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
var path_1 = require("path");
var uuid_1 = require("uuid");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
var storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: function (req, file) { return ({
        folder: 'bug-reports',
        public_id: "" + uuid_1.v4() + path_1["default"].extname(file.originalname)
    }); }
});
exports.upload = multer_1["default"]({
    storage: storage
});
