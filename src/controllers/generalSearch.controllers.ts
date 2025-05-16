import { Request, Response } from 'express';
import { getVendorsCategoriesAndProductsService, getVendorCategoriesWithProductsService, getCategoryDetailsWithRelatedDataService, getStoresByProductIdService } from '../services/generalSearch.service';

// Controller Function
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


export const getVendorCategoriesWithProductsController = async (req: Request, res: Response) => {
  const { vendorId } = req.params;

   if (!vendorId) {
    return res.status(400).json({ error: 'Vendor ID is required' });
  }

  try {
    const results = await getVendorCategoriesWithProductsService(vendorId);
    res.json(results);
  } catch (error: any) {
    // Handle errors from the service (e.g., database errors)
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};


// Controller Function
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


// Controller Function
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
