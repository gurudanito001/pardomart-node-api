import { Request, Response } from 'express';
import { getVendorsCategoriesAndProductsService, getVendorCategoriesWithProductsService, getCategoryDetailsWithRelatedDataService, getStoresByProductIdService } from '../services/generalSearch.service';

/**
 * @swagger
 * /search:
 *   get:
 *     summary: General search for vendors, categories, and products
 *     tags: [General Search]
 *     description: Performs a search across vendors, categories, and products based on a keyword and user's location.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The search term.
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
 *         description: A list of matching vendors, categories, and products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneralSearchResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
export const getVendorsCategoriesAndProductsController = async (req: Request, res: Response) => {
  const { search, latitude, longitude } = req.query;

  // Basic validation of input parameters
  if (!search || typeof search !== 'string') {
    return res
      .status(400)
      .json({ error: 'Search term is required and must be a string' });
  }

  const latitudeNum = Number(latitude);
  const longitudeNum = Number(longitude);

  if (
    !latitude ||
    isNaN(latitudeNum) ||
    !longitude ||
    isNaN(longitudeNum)
  ) {
    return res
      .status(400)
      .json({
        error:
          'Latitude and longitude are required and must be valid numbers',
      });
  }

  try {
    const results = await getVendorsCategoriesAndProductsService(search, latitudeNum, longitudeNum);
    res.json(results);
  } catch (error: any) {
    // Handle errors from the service (e.g., database errors)
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /search/vendor/{vendorId}:
 *   get:
 *     summary: Get categories and products for a specific vendor
 *     tags: [General Search]
 *     description: Retrieves a list of product categories and a sample of products within those categories for a given vendor. Can be filtered by a parent category.
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor.
 *       - in: query
 *         name: parentCategoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional. The ID of a parent category to filter the results.
 *     responses:
 *       200:
 *         description: A list of parent categories and sub-categories with their products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesWithProductsResult'
 *       400:
 *         description: Bad request due to missing vendor ID.
 */
export const getVendorCategoriesWithProductsController = async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  const {parentCategoryId} = req.query as {parentCategoryId: string}

   if (!vendorId) {
    return res.status(400).json({ error: 'Vendor ID is required' });
  }

  try {
    const results = await getVendorCategoriesWithProductsService(vendorId, parentCategoryId);
    res.json(results);
  } catch (error: any) {
    // Handle errors from the service (e.g., database errors)
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /search/category/{categoryId}:
 *   get:
 *     summary: Get details for a category, including stores and products
 *     tags: [General Search]
 *     description: Retrieves details for a specific category, along with a list of stores that carry products from that category (or its children), sorted by proximity to the user.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category.
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude for proximity sorting.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude for proximity sorting.
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional. Filter results to a specific vendor.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (currently not implemented in model).
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (currently not implemented in model).
 *     responses:
 *       200:
 *         description: Category details along with related stores and products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryDetailsResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
export const getCategoryDetailsWithRelatedDataController = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const page = parseInt((req.query.page?.toString() || '1'), 10);
  const take = parseInt((req.query.take?.toString() || '10'), 10);
  const vendorId = req?.query?.vendorId?.toString();
  const latitude = req.query.latitude ? parseFloat(req.query.latitude.toString()) : undefined;
  const longitude = req.query.longitude ? parseFloat(req.query.longitude.toString()) : undefined;

  // Validation
  if (!categoryId) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ error: 'Page must be a positive number' });
  }

  if (isNaN(take) || take < 1) {
    return res.status(400).json({ error: 'Take must be a positive number' });
  }

  try {
    const results = await getCategoryDetailsWithRelatedDataService({
      categoryId,
      page,
      take,
      userLatitude:  latitude,
      userLongitude: longitude,
      vendorId
    });
    res.json(results);
  } catch (error: any) {
    // Handle errors from the service (e.g., database errors)
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /search/product:
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
 */
export const getStoresByProductIdController = async (req: Request, res: Response) => {
  //const { productId } = req.params;
  const {search, latitude, longitude } = req.query;

  // Input validation
  if (!search) {
    return res.status(400).json({ error: 'Search Term is required' });
  }
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  const userSearchTerm = search.toString();
  const userLatitude = parseFloat(latitude as string);
  const userLongitude = parseFloat(longitude as string);

    if (isNaN(userLatitude) || isNaN(userLongitude)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude values' });
    }

  try {
    const result = await getStoresByProductIdService(userSearchTerm, userLatitude, userLongitude);
    res.json(result);
  } catch (error: any) {
    // Handle errors from the service
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
