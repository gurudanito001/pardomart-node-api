import { Request, Response } from 'express';
import { searchProductsService, searchStoreService, searchByCategoryService, searchStoreProductsService, searchByCategoryIdService } from '../services/generalSearch.service';


/**
 * @swagger
 * /generalSearch/product:
 *   get:
 *     summary: Find stores that sell a specific product
 *     tags: [General Search]
 *     description: Searches for a product by name and returns a list of stores that sell it, sorted by proximity to the user. Each store result includes other products they sell.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the product to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores selling the product, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 * components:
 *   schemas:
 *     VendorProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         vendorId:
 *           type: string
 *           format: uuid
 *         productId:
 *           type: string
 *           format: uuid
 *         price:
 *           type: number
 *           format: float
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         discountedPrice:
 *           type: number
 *           format: float
 *           nullable: true
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         weight:
 *           type: number
 *           format: float
 *           nullable: true
 *         weightUnit:
 *           type: string
 *           nullable: true
 *         stock:
 *           type: integer
 *           nullable: true
 *         isAvailable:
 *           type: boolean
 *         isAlcohol:
 *           type: boolean
 *         isAgeRestricted:
 *           type: boolean
 *         attributes:
 *           type: object
 *           nullable: true
 *         categoryIds:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Vendor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         tagline:
 *           type: string
 *           nullable: true
 *         details:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           format: uri
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         longitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         latitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         timezone:
 *           type: string
 *           nullable: true
 *         isVerified:
 *           type: boolean
 *         meta:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VendorWithExtras:
 *       allOf:
 *         - $ref: '#/components/schemas/Vendor'
 *         - type: object
 *           properties:
 *             distance:
 *               type: number
 *               format: float
 *               description: Distance to the vendor from the user's location in kilometers.
 *             rating:
 *               type: object
 *               properties:
 *                 average:
 *                   type: number
 *                   format: float
 *                   description: The average rating score.
 *                 count:
 *                   type: integer
 *                   description: The total number of ratings.
 *     StoreWithProducts:
 *       type: object
 *       properties:
 *         vendor:
 *           $ref: '#/components/schemas/VendorWithExtras'
 *         products:
 *           type: array
 *           description: A sample of products from the store that match the search criteria (if applicable).
 *           items:
 *             $ref: '#/components/schemas/VendorProduct'
 *         totalProducts:
 *           type: integer
 *           description: The total number of products in the store that match the search criteria (if applicable).
 *     StoresByProductResult:
 *       type: object
 *       properties:
 *         stores:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StoreWithProducts'
 */
export const searchByProductController = async (req: Request, res: Response) => {
  const {search, latitude, longitude } = req.query;

  const userSearchTerm = search as string; // Already validated
  const userLatitude = latitude as unknown as number; // Validated and converted by middleware
  const userLongitude = longitude as unknown as number; // Validated and converted by middleware

  try {
    const result = await searchProductsService(userSearchTerm, userLatitude, userLongitude);
    res.json(result);
  } catch (error: any) {
    // Handle errors from the service
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /generalSearch/store:
 *   get:
 *     summary: Find stores by name
 *     tags: [General Search]
 *     description: Searches for a store by name and returns a list of stores, sorted by proximity to the user. Each store result includes products they sell.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the store to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores matching the search, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
export const searchByStoreController = async (req: Request, res: Response) => {
  const {search, latitude, longitude } = req.query;

  const userSearchTerm = search as string; // Already validated
  const userLatitude = latitude as unknown as number; // Validated and converted by middleware
  const userLongitude = longitude as unknown as number; // Validated and converted by middleware

  try {
    const result = await searchStoreService(userSearchTerm, userLatitude, userLongitude);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /generalSearch/category:
 *   get:
 *     summary: Find stores by category name
 *     tags: [General Search]
 *     description: Searches for a category by name and returns a list of stores that sell products in that category, sorted by proximity to the user.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the category to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores matching the category search, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
export const searchByCategoryController = async (req: Request, res: Response) => {
  const { search, latitude, longitude } = req.query;

  const userSearchTerm = search as string; // Already validated
  const userLatitude = latitude as unknown as number; // Validated and converted by middleware
  const userLongitude = longitude as unknown as number; // Validated and converted by middleware

  try {
    const result = await searchByCategoryService(userSearchTerm, userLatitude, userLongitude);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /generalSearch/category/{categoryId}:
 *   get:
 *     summary: Find stores by category ID
 *     tags: [General Search]
 *     description: Searches for a category by ID and returns a list of stores that sell products in that category (and its sub-categories), sorted by proximity to the user.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores matching the category search, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
export const searchByCategoryIdController = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { latitude, longitude } = req.query;

  try {
    const result = await searchByCategoryIdService(categoryId, latitude as unknown as number, longitude as unknown as number);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /generalSearch/storeProducts/{storeId}:
 *   get:
 *     summary: Search for products within a specific store
 *     tags: [General Search]
 *     description: >
 *       Searches for products within a specific store, optionally filtering by a search term and/or category.
 *       If no categoryId is provided, it returns products grouped by their parent category.
 *       If a categoryId is provided, it returns a flat list of products within that category.
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the store (vendor) to search within.
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: The search term to filter products by name.
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to filter products by. If provided, results will not be grouped.
 *     responses:
 *       200:
 *         description: A list of products from the store. The structure depends on whether `categoryId` is provided.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   description: "Returned when categoryId is not provided. Products are grouped by parent category."
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                         format: uri
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       products:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/VendorProduct'
 *                 - type: array
 *                   description: "Returned when categoryId is provided. A flat list of products."
 *                   items:
 *                     $ref: '#/components/schemas/VendorProduct'
 *       400:
 *         description: Bad request due to missing storeId.
 *       404:
 *         description: Store not found.
 *       500:
 *         description: Internal server error.
 */
export const searchStoreProductsController = async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { searchTerm, categoryId } = req.query;

  try {
    const result = await searchStoreProductsService(storeId, searchTerm as string | undefined, categoryId as string | undefined);
    if (result === null) {
      return res.status(404).json({ error: 'Store not found.' });
    }
    res.json(result);
  } catch (error: any) {
    console.error('Error searching store products:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
