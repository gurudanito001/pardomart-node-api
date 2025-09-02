


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
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
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
  } catch (error) {
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
export const getVendorProductByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendorProduct = await productService.getVendorProductById(id);
    if (!vendorProduct) {
      return res.status(404).json({ error: 'Vendor product not found' });
    }
    res.json(vendorProduct);
  } catch (error) {
    console.error(`Error in getVendorProductByIdController: ${error}`);
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
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }
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
    if (!barcode || !vendorId) {
      return res.status(400).json({ error: 'Barcode and vendorId are required' });
    }
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
    const { tagIds } = req.query;

    if (!tagIds || typeof tagIds === 'string') {
      return res.status(400).json({ error: 'tagIds query parameter is required and must be an array' });
    }

    const tagIdsArray = (tagIds as string[]).map(String);

    const products = await productService.getProductsByTagIds(tagIdsArray);
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
    const { tagIds } = req.query;

    if (!tagIds || typeof tagIds === 'string') {
      return res.status(400).json({ error: 'tagIds query parameter is required and must be an array' });
    }

    const tagIdsArray = (tagIds as string[]).map(String);

    const vendorProducts = await productService.getVendorProductsByTagIds(tagIdsArray);
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
 */
export const updateProductBase = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProductBase({ id: req.params.id, ...req.body });
    res.json(product);
  } catch (error) {
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
 */
export const updateVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.updateVendorProduct({ id: req.params.id, ...req.body });
    res.json(vendorProduct);
  } catch (error) {
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
 *       400:
 *         description: Vendor ID and Category ID are required.
 */
export const getVendorProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { vendorId, categoryId } = req.query;

    if (!vendorId || !categoryId) {
      return res.status(400).json({ error: 'Vendor ID and Category ID are required' });
    }

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
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.json(product);
  } catch (error) {
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
 */
export const deleteVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.deleteVendorProduct(req.params.id);
    res.json(vendorProduct);
  } catch (error) {
    console.error('Error deleting vendor product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};