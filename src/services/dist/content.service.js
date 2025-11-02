"use strict";
exports.__esModule = true;
exports.updateContentService = exports.getContentService = void 0;
var contentModel = require("../models/content.model");
/**
 * Service to get content by its type.
 * @param type The type of the content to retrieve.
 * @returns The content object.
 */
exports.getContentService = function (type) {
    return contentModel.getContentByType(type);
};
/**
 * Service to update content by its type.
 * @param type The type of the content to update.
 * @param payload The data to update the content with.
 * @returns The updated content object.
 */
exports.updateContentService = function (type, payload) {
    return contentModel.upsertContent(type, payload);
};
