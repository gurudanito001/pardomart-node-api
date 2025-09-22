"use strict";
exports.__esModule = true;
exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
var prisma_1 = require("../config/prisma");
/**
 * Retrieves all active FAQs, ordered by sortOrder.
 */
exports.getAll = function () {
    return prisma_1.prisma.faq.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
    });
};
/**
 * Retrieves a single FAQ by its ID.
 * @param id The ID of the FAQ to retrieve.
 */
exports.getById = function (id) {
    return prisma_1.prisma.faq.findUnique({ where: { id: id } });
};
/**
 * Creates a new FAQ.
 * @param data The data for the new FAQ.
 */
exports.create = function (data) {
    return prisma_1.prisma.faq.create({ data: data });
};
/**
 * Updates an existing FAQ by its ID.
 * @param id The ID of the FAQ to update.
 * @param data The data to update.
 */
exports.update = function (id, data) {
    return prisma_1.prisma.faq.update({ where: { id: id }, data: data });
};
/**
 * Deletes an FAQ by its ID.
 * @param id The ID of the FAQ to delete.
 */
exports.remove = function (id) {
    return prisma_1.prisma.faq["delete"]({ where: { id: id } });
};
