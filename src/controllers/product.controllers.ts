
// controllers/product.controller.ts
import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { Prisma } from '@prisma/client';
import { getVendorProductsFilters } from '../models/product.model';

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a base product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new base product in the system. This is the generic version of a product, not tied to a specific vendor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductPayload'
 *     responses:
 *       201:
 *         description: The created product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductWithRelations'
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         barcode: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         attributes: { type: object, nullable: true }
 *         meta: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CategorySummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *     TagSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *     ProductWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Product'
 *         - type: object
 *           properties:
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategorySummary'
 *             tags:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TagSummary'
 *     VendorProduct:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         vendorId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         isAvailable: { type: boolean }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         attributes: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorProductWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorProduct'
 *         - type: object
 *           properties:
 *             product:
 *               $ref: '#/components/schemas/Product'
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategorySummary'
 *             tags:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TagSummary'
 *     CreateProductPayload:
 *       type: object
 *       required: [barcode, name, categoryIds]
 *       properties:
 *         barcode: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         attributes: { type: object, nullable: true }
 *         meta: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string, format: uuid }, description: "Array of category IDs to associate with the product." }
 *         tagIds: { type: array, items: { type: string, format: uuid }, description: "Array of tag IDs to associate with the product." }
 *         isAlcohol: { type: boolean, default: false }
 *         isAgeRestricted: { type: boolean, default: false }
 *     CreateVendorProductPayload:
 *       type: object
 *       required: [vendorId, productId, price, name, categoryIds]
 *       properties:
 *         vendorId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         price: { type: number, format: float }
 *         name: { type: string, description: "The name for the vendor-specific product, which can override the base product name." }
 *         description: { type: string, nullable: true }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         isAvailable: { type: boolean, default: true }
 *         categoryIds: { type: array, items: { type: string, format: uuid } }
 *         tagIds: { type: array, items: { type: string, format: uuid } }
 *     CreateVendorProductWithBarcodePayload:
 *       type: object
 *       required: [vendorId, barcode, price, name, categoryIds]
 *       properties:
 *         vendorId: { type: string, format: uuid }
 *         barcode: { type: string }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         categoryIds: { type: array, items: { type: string, format: uuid } }
 *         tagIds: { type: array, items: { type: string, format: uuid } }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         isAvailable: { type: boolean, default: true }
 *     UpdateProductBasePayload:
 *       type: object
 *       properties:
 *         barcode: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         attributes: { type: object, nullable: true }
 *         meta: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string, format: uuid } }
 *         tagIds: { type: array, items: { type: string, format: uuid } }
 *     UpdateVendorProductPayload:
 *       type: object
 *       properties:
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         isAvailable: { type: boolean }
 *         categoryIds: { type: array, items: { type: string, format: uuid } }
 *         tagIds: { type: array, items: { type: string, format: uuid } }
 *     PaginatedVendorProducts:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         totalPages: { type: integer }
 *         pageSize: { type: integer }
 *         totalCount: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VendorProduct'
 *     TrendingVendorProduct:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorProduct'
 *         - type: object
 *           properties:
 *             orderCount:
 *               type: integer
 *               description: "The number of times this product has been ordered."
 *     PaginatedTrendingVendorProducts:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         total: { type: integer, description: "Total number of unique trending products." }
 *         size: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrendingVendorProduct'
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'A product with this barcode already exists.' });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor:
 *   post:
 *     summary: Create a vendor-specific product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a product listing for a specific vendor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorProductPayload'
 *     responses:
 *       201:
 *         description: The created vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 */
export const createVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.createVendorProduct(req.body);
    res.status(201).json(vendorProduct);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'This product is already listed by this vendor.' });
    }
    console.error('Error creating vendor product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor/{id}:
 *   get:
 *     summary: Get a vendor-specific product by its ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor product to find.
 *     responses:
 *       200:
 *         description: The found vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       404:
 *         description: Vendor product not found.
 */
export const getVendorProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendorProduct = await productService.getVendorProductById(id);
    if (!vendorProduct) {
      return res.status(404).json({ error: 'Vendor product not found' });
    }
    res.json(vendorProduct);
  } catch (error) {
    console.error(`Error in getVendorProductById: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor/barcode:
 *   post:
 *     summary: Create a vendor product via barcode scan
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a vendor product by scanning a barcode. If the base product doesn't exist, it's created first.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorProductWithBarcodePayload'
 *     responses:
 *       201:
 *         description: The created vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       409:
 *         description: Conflict - This product is already listed by this vendor.
 */
export const createVendorProductWithBarcode = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.createVendorProductWithBarcode(req.body);
    res.status(201).json(vendorProduct);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error?.code === 'P2002') {
      // Construct a user-friendly error message
      return res.status(409).json({
        error: 'This product is already listed by this vendor.',
      });
    }
    console.error('Error creating vendor product with barcode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

};

/**
 * @swagger
 * /product/barcode:
 *   get:
 *     summary: Get a base product by its barcode
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode of the product to find.
 *     responses:
 *       200:
 *         description: The found product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductWithRelations'
 *       400:
 *         description: Barcode is required.
 *       404:
 *         description: Product not found.
 */
export const getProductByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.query;
    const product = await productService.getProductByBarcode(barcode as string);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error getting product by barcode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor/barcode:
 *   get:
 *     summary: Get a vendor-specific product by barcode
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode of the product.
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor.
 *     responses:
 *       200:
 *         description: The found vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       400:
 *         description: Barcode and vendorId are required.
 *       404:
 *         description: Vendor product not found.
 */
export const getVendorProductByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode, vendorId } = req.query;
    const vendorProduct = await productService.getVendorProductByBarcode(barcode as string, vendorId as string);
    if (!vendorProduct) {
      return res.status(404).json({ error: 'Vendor product not found' });
    }
    res.json(vendorProduct);
  } catch (error) {
    console.error('Error getting vendor product by barcode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/tags/ids:
 *   get:
 *     summary: Get base products by tag IDs
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: tagIds
 *         required: true
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         description: An array of tag IDs to filter products by.
 *     responses:
 *       200:
 *         description: A list of products matching the tag IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductWithRelations'
 *       400:
 *         description: tagIds query parameter is required.
 */
export const getProductsByTagIds = async (req: Request, res: Response) => {
  try {
    const products = await productService.getProductsByTagIds(req.query.tagIds as string[]);
    res.json(products);
  } catch (error) {
    console.error('Error getting products by tag IDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor/tags/ids:
 *   get:
 *     summary: Get vendor products by tag IDs
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: tagIds
 *         required: true
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         description: An array of tag IDs to filter vendor products by.
 *     responses:
 *       200:
 *         description: A list of vendor products matching the tag IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorProductWithRelations'
 *       400:
 *         description: tagIds query parameter is required.
 */
export const getVendorProductsByTagIds = async (req: Request, res: Response) => {
  try {
    const { tagIds, vendorId } = req.query;
    const vendorProducts = await productService.getVendorProductsByTagIds(tagIds as string[]);
    res.json(vendorProducts);
  } catch (error) {
    console.error('Error getting vendor products by tag IDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/{id}:
 *   patch:
 *     summary: Update a base product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the base product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductBasePayload'
 *     responses:
 *       200:
 *         description: The updated product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductWithRelations'
 *       404:
 *         description: Product not found.
 */
export const updateProductBase = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProductBase({ id: req.params.id, ...req.body });
    res.json(product);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found.' });
    }
    console.error('Error updating product base:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor/{id}:
 *   patch:
 *     summary: Update a vendor-specific product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendorProductPayload'
 *     responses:
 *       200:
 *         description: The updated vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       404:
 *         description: Vendor product not found.
 */
export const updateVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.updateVendorProduct({ id: req.params.id, ...req.body });
    res.json(vendorProduct);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor product not found.' });
    }
    console.error('Error updating vendor product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all base products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: A list of all base products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductWithRelations'
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting all products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor:
 *   get:
 *     summary: Get all vendor products with filtering and pagination
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by product name (case-insensitive contains).
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Filter by vendor ID.
 *       - in: query
 *         name: productId
 *         schema: { type: string, format: uuid }
 *         description: Filter by base product ID.
 *       - in: query
 *         name: categoryIds
 *         style: form
 *         explode: true
 *         schema: { type: array, items: { type: string, format: uuid } }
 *         description: Filter by an array of category IDs.
 *       - in: query
 *         name: tagIds
 *         style: form
 *         explode: true
 *         schema: { type: array, items: { type: 'string', format: 'uuid' } }
 *         description: Filter by an array of tag IDs.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of vendor products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedVendorProducts'
 */
export const getAllVendorProducts = async (req: Request, res: Response) => {
  const {name, vendorId, categoryIds, tagIds, productId}: getVendorProductsFilters = req.query;
  const page = req?.query?.page?.toString() || "1";
  const take = req?.query?.size?.toString() || "20"; 
  try {
    const vendorProducts = await productService.getAllVendorProducts({name, vendorId, categoryIds, tagIds, productId}, {page, take});
    res.json(vendorProducts);
  } catch (error) {
    console.error('Error getting vendor products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor/category:
 *   get:
 *     summary: Get vendor products by category
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor.
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the category.
 *     responses:
 *       200:
 *         description: A list of vendor products in the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorProductWithRelations'
 *       400:
 *         description: Vendor ID and Category ID are required.
 */
export const getVendorProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { vendorId, categoryId } = req.query;
    const vendorProducts = await productService.getVendorProductsByCategory(
      vendorId as string,
      categoryId as string
    );

    res.json(vendorProducts);
  } catch (error) {
    console.error('Error getting vendor products by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete a base product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the base product to delete.
 *     responses:
 *       200:
 *         description: The deleted product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.json(product);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found.' });
    }
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /product/vendor/{id}:
 *   delete:
 *     summary: Delete a vendor-specific product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor product to delete.
 *     responses:
 *       200:
 *         description: The deleted vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProduct'
 *       404:
 *         description: Vendor product not found.
 */
export const deleteVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.deleteVendorProduct(req.params.id);
    res.json(vendorProduct);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor product not found.' });
    }
    console.error('Error deleting vendor product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


/**
 * @swagger
 * /product/vendor/trending:
 *   get:
 *     summary: Get trending vendor products
 *     tags: [Product, Vendor]
 *     description: Retrieves a list of vendor products that are trending, based on the number of times they have been ordered.
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter trending products by a specific vendor ID.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 5 }
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of trending vendor products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTrendingVendorProducts'
 */
export const getTrendingVendorProducts = async (req: Request, res: Response) => {
  const { vendorId } = req.query;
  const page = req.query.page?.toString() || "1";
  const take = req.query.size?.toString() || "5";

  try {
    const result = await productService.getTrendingVendorProductsService(
      { vendorId: vendorId as string | undefined },
      { page, take }
    );
    res.json(result);
  } catch (error) {
    console.error('Error getting trending vendor products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};