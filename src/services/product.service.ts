// services/product.service.ts
import { Prisma, VendorProduct, Role } from '@prisma/client';
import * as productModel from '../models/product.model';
import * as vendorModel from '../models/vendor.model';
import { uploadMedia } from './media.service';
import { getAggregateRatingService } from './rating.service';

/**
 * Helper to inject effectivePrice into a vendor product object.
 */
const mapEffectivePrice = <T extends { price: number; discountedPrice?: number | null }>(vp: T) => {
  return {
    ...vp,
    effectivePrice: vp.discountedPrice ?? vp.price,
  };
};

const mapEffectivePriceList = <T extends { price: number; discountedPrice?: number | null }>(list: T[]) => {
  return list.map(mapEffectivePrice);
};

/**
 * Uploads an array of base64 encoded images to Cloudinary.
 *
 * @param images - An array of base64 image strings.
 * @param referenceId - A reference ID (like vendorProductId or productId) for naming.
 * @returns A promise that resolves to an array of secure Cloudinary URLs.
 */
const uploadImages = async (images: string[], referenceId: string): Promise<string[]> => {
  const imageUrls: string[] = [];
  if (!images || images.length === 0) {
    return imageUrls;
  }

  const uploadPromises = images.map(async (base64Image, index) => {
    // Skip if the "image" is already a URL
    if (base64Image.startsWith('http')) {
      return base64Image;
    }

    try {
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${referenceId}-product-image-${index}.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new (require('stream').Readable)(),
        destination: '',
        filename: '',
        path: '',
      };

      const uploadResult = await uploadMedia(mockFile, referenceId, 'product_image');
      return uploadResult.cloudinaryResult.secure_url;
    } catch (error) {
      console.error(`Error uploading product image at index ${index}:`, error);
      // Return null or an empty string to signify failure for this image
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  // Filter out any null results from failed uploads
  return results.filter((url): url is string => url !== null);
};


/**
 * Creates a new vendor-specific product, verifying ownership and handling image uploads.
 * @param payload - The data for creating the vendor product.
 * @param ownerId - The ID of the user (vendor owner) making the request.
 * @returns The created vendor product with its relations.
 */
export const createVendorProduct = async (payload: productModel.CreateVendorProductPayload, ownerId: string): Promise<VendorProduct> => {
  // 1. Authorization: Verify the user owns the vendor.
  const vendor = await vendorModel.getVendorById(payload.vendorId);
  if (!vendor || vendor.userId !== ownerId) {
    throw new Error('Unauthorized: You do not own this vendor.');
  }

  // Ensure discounted price is lower than the actual price
  if (payload.discountedPrice !== undefined && payload.discountedPrice !== null && payload.discountedPrice >= payload.price) {
    throw new Error('Discounted price must be lower than the original price.');
  }

  // Inherit EBT eligibility from base product if not provided
  if (payload.isEbtEligible === undefined) {
    const baseProduct = await productModel.getProductById(payload.productId);
    if (baseProduct) {
      payload.isEbtEligible = baseProduct.isEbtEligible;
    }
  }

  // Inherit Perishable status from base product if not provided
  if (payload.isPerishable === undefined) {
    const baseProduct = await productModel.getProductById(payload.productId);
    if (baseProduct) {
      payload.isPerishable = baseProduct.isPerishable;
    }
  }

  const { images, ...productData } = payload;
  let processedImageUrls: string[] = [];

  // 2. Generate a new UUID for the vendor product using dynamic import.
  const { v4: uuidv4 } = await import('uuid');
  const vendorProductId = uuidv4();

  // 3. Upload images to Cloudinary using the new ID.
  if (images && images.length > 0) {
    processedImageUrls = await uploadImages(images, vendorProductId);
  }

  // 4. Create the vendor product in the database with all data at once.
  const finalPayload = {
    ...productData,
    id: vendorProductId, // Use the pre-generated ID
    images: processedImageUrls,
  };

  const created = await productModel.createVendorProduct(finalPayload);
  return mapEffectivePrice(created) as any;
};

// Keep other service functions from the original file if they exist.
// For this example, I'm only adding the createVendorProduct service.
// The following are placeholders for other functions from your controller.

export const createProduct = (payload: any) => productModel.createProduct(payload);

export const getVendorProductById = async (id: string) => {
  const vendorProduct = await productModel.getVendorProductById(id);
  if (!vendorProduct) return null;

  const rating = await getAggregateRatingService({ ratedProductId: vendorProduct.productId });
  return {
    ...vendorProduct,
    effectivePrice: vendorProduct.discountedPrice ?? vendorProduct.price,
    rating: rating || { average: 5, count: 0 },
  };
};

export const getVendorProductByIdService = async (
  id: string,
  requestor?: { userId?: string; userRole?: Role; staffVendorId?: string }
) => {
  const vendorProduct = await productModel.getVendorProductByIdWithPrivilegeCheck(id, requestor);
  if (!vendorProduct) return null;
  const rating = await getAggregateRatingService({ ratedProductId: vendorProduct.productId });
  return { ...vendorProduct, effectivePrice: vendorProduct.discountedPrice ?? vendorProduct.price, rating: rating || { average: 5, count: 0 } };
};

/**
 * Creates a vendor product from a barcode, handling image uploads.
 * If the base product doesn't exist, it's created.
 * @param ownerId - The ID of the user (vendor owner) making the request.
 * @param payload - The data for creating the vendor product, including barcode and images.
 * @returns The created vendor product with its relations.
 */
export const createVendorProductWithBarcode = async (payload: any, ownerId: string): Promise<VendorProduct> => {
  // 1. Authorization: Verify the user owns the vendor.
  const vendor = await vendorModel.getVendorById(payload.vendorId);
  if (!vendor || vendor.userId !== ownerId) {
    throw new Error('Unauthorized: You do not own this vendor.');
  }

  // Ensure discounted price is lower than the actual price
  if (payload.discountedPrice !== undefined && payload.discountedPrice !== null && payload.discountedPrice >= payload.price) {
    throw new Error('Discounted price must be lower than the original price.');
  }

  const { images, barcode, ...productData } = payload;
  let productId: string;
  let processedImageUrls: string[] = [];

  // 2. Find or create the base product
  const existingProduct = await productModel.getProductByBarcode(payload.barcode);

  const { v4: uuidv4 } = await import('uuid');
  const vendorProductId = uuidv4(); // Generate vendor product ID upfront

  if (!existingProduct) {
    // If creating a new product, upload images for it. These will also be used by the vendor product.
    if (images && images.length > 0) {
      // Use vendorProductId as reference for consistency, as these images are for the first listing
      processedImageUrls = await uploadImages(images, vendorProductId);
    }

    const newProduct = await productModel.createProduct({
      barcode: payload.barcode,
      name: payload.name,
      description: payload.description,
      images: processedImageUrls,
      weight: payload.weight,
      weightUnit: payload.weightUnit,
      isAlcohol: payload.isAlcohol,
      isAgeRestricted: payload.isAgeRestricted,
      attributes: payload.attributes,
      meta: payload.meta,
      isEbtEligible: payload.isEbtEligible,
      isPerishable: payload.isPerishable,
      categoryIds: payload.categoryIds || [],
      tagIds: payload.tagIds || [],
    });
    productId = newProduct.id;
  } else {
    productId = existingProduct.id;
    // If product exists, vendor can still provide their own images for their own listing.
    if (images && images.length > 0) {
      processedImageUrls = await uploadImages(images, vendorProductId);
    }
  }

  // 3. Create the VendorProduct with the processed image URLs
  const vendorProductPayload: productModel.CreateVendorProductPayload = {
    ...productData,
    id: vendorProductId, // Use the pre-generated ID
    productId: productId,
    images: processedImageUrls,
  };

  const created = await productModel.createVendorProduct(vendorProductPayload);
  return mapEffectivePrice(created) as any;
};

/**
 * Retrieves an overview of product counts.
 * @returns An object with total products and total vendor products.
 */
export const getProductOverviewService = async () => {
  return productModel.getProductOverview();
};

/**
 * (Admin) Retrieves a paginated list of all base products with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of products.
 */
export const adminGetAllProductsService = async (
  filters: productModel.AdminGetAllProductsFilters,
  pagination: { page: string; take: string }
) => {
  return productModel.adminGetAllProducts(filters, pagination);
};

/**
 * (Admin) Retrieves a paginated list of all vendor products for a specific base product.
 * @param productId - The ID of the base product.
 * @param pagination - The pagination options.
 * @returns A paginated list of vendor products.
 */
export const getVendorProductsForProductService = async (
  productId: string,
  pagination: { page: string; size: string }
) => {
  const result = await productModel.getVendorProductsForProduct(productId, pagination);
  return {
    ...result,
    data: mapEffectivePriceList(result.data)
  };
};

/**
 * (Admin) Updates the active status of a base product.
 * @param productId The ID of the product to update.
 * @param isActive The new active status.
 * @returns The updated product.
 */
export const updateProductStatusService = async (productId: string, isActive: boolean) => {
  // The model's updateProductBase can handle this simple update.
  return productModel.updateProductBase({ id: productId, isActive });
};

/**
 * Retrieves all vendor products across all stores owned by a specific vendor user.
 * @param ownerId - The ID of the vendor owner.
 * @param vendorId - Optional. The ID of a specific store to filter by.
 * @param pagination - Pagination options.
 * @returns A list of all vendor products.
 */
export const getMyVendorProductsService = async (ownerId: string, vendorId?: string, pagination?: { page: string, take: string }) => {
  // The base authorization for the 'vendor' role is handled by the route middleware.

  // This service adds a more specific authorization check: if a vendorId filter is used,
  // we must ensure the requesting vendor owns that specific store.
  if (vendorId) {
    const vendor = await vendorModel.getVendorById(vendorId);
    if (!vendor || vendor.userId !== ownerId) {
      throw new Error('Forbidden: You do not own this store or the store does not exist.');
    }
  }

  // Now, call the model with the owner's ID and the validated (or undefined) vendorId.
  const result = await productModel.getVendorProductsByOwnerId(ownerId, vendorId, pagination);
  return {
    ...result,
    data: mapEffectivePriceList(result.data)
  };
};

export const getProductByBarcode = (barcode: string) => productModel.getProductByBarcode(barcode);
export const getVendorProductByBarcode = async (barcode: string, vendorId: string) => {
  const vp = await productModel.getVendorProductByBarcode(barcode, vendorId);
  return vp ? mapEffectivePrice(vp) : null;
};
export const getProductsByTagIds = (tagIds: string[]) => productModel.getProductsByTagIds(tagIds);
export const getVendorProductsByTagIds = async (tagIds: string[]) => {
  const products = await productModel.getVendorProductsByTagIds(tagIds);
  return mapEffectivePriceList(products);
};
export const updateProductBase = (payload: any) => productModel.updateProductBase(payload);
export const updateVendorProduct = async (payload: any) => {
  // Fetch current state to validate against new inputs
  const currentVP = await productModel.getVendorProductById(payload.id);
  if (!currentVP) {
    throw new Error('Vendor product not found.');
  }

  const newPrice = payload.price !== undefined ? payload.price : currentVP.price;
  const newDiscountedPrice = payload.discountedPrice !== undefined ? payload.discountedPrice : currentVP.discountedPrice;

  if (newDiscountedPrice !== null && newDiscountedPrice !== undefined && newDiscountedPrice >= newPrice) {
    throw new Error('Discounted price must be lower than the original price.');
  }

  const vp = await productModel.updateVendorProduct(payload);
  return mapEffectivePrice(vp);
};
export const getAllProducts = () => productModel.getAllProducts();
export const getAllVendorProducts = async ( // Streamlined for customer app
  filters: productModel.getVendorProductsFilters,
  pagination: { page: string; take: string }
) => {
  const result = await productModel.getAllVendorProducts(filters, pagination);
  return {
    ...result,
    data: mapEffectivePriceList(result.data)
  };
};
export const getVendorProductsByCategory = async (vendorId: string, categoryId: string) => {
  const products = await productModel.getVendorProductsByCategory(vendorId, categoryId);
  return mapEffectivePriceList(products);
};
export const getVendorProductsByUser = async (userId: string) => {
  const products = await productModel.getVendorProductsByUserId(userId);
  return mapEffectivePriceList(products);
};
export const deleteProduct = (id: string) => productModel.deleteProduct(id);
export const getTrendingVendorProductsService = async (
  filters: any, 
  pagination: any,
  requestor?: { userId?: string; userRole?: Role; staffVendorId?: string }
) => {
  const result = await productModel.getTrendingVendorProducts(filters, pagination, requestor);
  return {
    ...result,
    data: mapEffectivePriceList(result.data)
  };
};

export const getVendorProductsForVendorAppService = async (
  filters: productModel.getVendorProductsFilters,
  pagination: { page: string; take: string },
  requestor: { userId: string; userRole: Role; staffVendorId?: string }
) => {
  const { vendorId } = filters;
  if (!vendorId) {
    throw new Error('vendorId is required.');
  }

  // Authorization
  if (requestor.userRole === Role.vendor) {
    const vendor = await vendorModel.getVendorById(vendorId);
    if (!vendor || vendor.userId !== requestor.userId) {
      throw new Error('Forbidden: You do not own this store.');
    }
  } else if (requestor.userRole === Role.store_admin || requestor.userRole === Role.store_shopper) {
    if (requestor.staffVendorId !== vendorId) {
      throw new Error('Forbidden: You can only view products for your assigned store.');
    }
  } else if (requestor.userRole !== Role.admin) {
    throw new Error('Forbidden: Access denied.');
  }

  const result = await productModel.getVendorProductsForVendorApp(filters, pagination);
  return {
    ...result,
    data: mapEffectivePriceList(result.data)
  };
};

/**
 * Deletes a vendor-specific product, ensuring the user has ownership.
 * @param vendorProductId The ID of the vendor product to delete.
 * @param requestingUserId The ID of the user making the request.
 * @param requestingUserRole The role of the user making the request.
 * @param staffVendorId The vendor ID from the staff member's token.
 * @returns The deleted vendor product.
 */
export const deleteVendorProduct = async (
  vendorProductId: string,
  requestingUserId: string,
  requestingUserRole: Role,
  staffVendorId?: string
): Promise<VendorProduct> => {
  const productToDelete = await productModel.getVendorProductById(vendorProductId);
  if (!productToDelete) {
    throw new Error('Vendor product not found.');
  }

  if (requestingUserRole === Role.vendor) {
    if (productToDelete.vendor.userId !== requestingUserId) {
      throw new Error('Forbidden: You do not own the store this product belongs to.');
    }
  } else if (requestingUserRole === Role.store_admin) {
    if (productToDelete.vendorId !== staffVendorId) {
      throw new Error('Forbidden: You can only delete products from your assigned store.');
    }
  } else {
    throw new Error('Forbidden: You do not have permission to delete this product.');
  }

  return productModel.deleteVendorProduct(vendorProductId);
};

/**
 * Transfers a vendor product from a source store to multiple target stores.
 * @param ownerId The ID of the vendor owner making the request.
 * @param sourceVendorProductIds An array of product listing IDs to copy.
 * @param targetVendorIds An array of store IDs to copy the product to.
 * @returns An object summarizing the transferred and skipped products.
 */
export const transferVendorProductsService = async (
  ownerId: string,
  sourceVendorProductIds: string[],
  targetVendorIds: string[]
) => {  
  // 1. Authorization: Verify the requester owns all target stores in one go.
  const ownedVendors = await vendorModel.getVendorsByUserId(ownerId);
  const ownedVendorIds = new Set(ownedVendors.map(v => v.id));
  for (const targetId of targetVendorIds) {
    if (!ownedVendorIds.has(targetId)) {
      throw new Error(`Forbidden: You do not own the target store with ID ${targetId}.`);
    }
  }

  // 2. Fetch all source products at once to avoid N+1 queries.
  const sourceProducts = await productModel.getVendorProductsByIds(sourceVendorProductIds);

  // 3. Authorization: Verify all source products exist and are owned by the requester.
  const sourceProductMap = new Map(sourceProducts.map(p => [p.id, p]));
  for (const sourceId of sourceVendorProductIds) {
    const product = sourceProductMap.get(sourceId);
    if (!product) {
      throw new Error(`Source product with ID ${sourceId} not found.`);
    }
    if (product.vendor.userId !== ownerId) {
      throw new Error(`Forbidden: You do not own the source product with ID ${sourceId}.`);
    }
  }

  const results = [];
  let successfulTransfers = 0;
  let skippedTransfers = 0;

  // 4. Iterate through each source product and perform the transfer.
  for (const sourceProduct of sourceProducts) {
    const result = await productModel.transferVendorProducts(sourceProduct, targetVendorIds);
    successfulTransfers += result.transferred.length;
    skippedTransfers += result.skipped.length;
    results.push({
      sourceVendorProductId: sourceProduct.id,
      transferredTo: result.transferred,
      skippedFor: result.skipped,
    });
  }

  // Optional: Invalidate cache or trigger re-indexing for the new products if needed.

  return {
    successfulTransfers,
    skippedTransfers,
    details: results,
  };
};

/**
 * (Temporary) One-time script to backfill base product details from their first vendor product.
 * This function iterates through all base products, finds the first associated vendor product,
 * and copies specified fields from the vendor product to the base product.
 * @returns A summary of the operation.
 */
export const backfillBaseProductsFromVendorProducts = async () => {
  console.log('Starting base product backfill process...');

  // 1. Get all base products
  const allProducts = await productModel.getAllProducts();
  console.log(`Found ${allProducts.length} base products to process.`);

  let updatedCount = 0;
  let skippedCount = 0;
  const errors: { productId: string; error: string }[] = [];

  for (const product of allProducts) {
    try {
      // 2. Find the first vendor product for the current base product
      const vendorProductList = await productModel.getVendorProductsForProduct(product.id, { page: '1', size: '1' });

      if (vendorProductList.data && vendorProductList.data.length > 0) {
        const firstVendorProductInfo = vendorProductList.data[0];
        // getVendorProductsForProduct doesn't return full details, so we fetch it fully
        const firstVendorProduct = await productModel.getVendorProductById(firstVendorProductInfo.id);

        if (!firstVendorProduct) {
          console.log(`Skipping product ${product.id}: Could not fetch full details for vendor product ${firstVendorProductInfo.id}.`);
          skippedCount++;
          continue;
        }

        // 3. Prepare the update payload for the base product
        const updatePayload: productModel.UpdateProductBasePayload = {
          id: product.id,
          name: firstVendorProduct.name,
          description: firstVendorProduct.description ?? undefined,
          images: firstVendorProduct.images,
          weight: firstVendorProduct.weight ?? undefined,
          weightUnit: firstVendorProduct.weightUnit ?? undefined,
          isAlcohol: firstVendorProduct.isAlcohol,
          isAgeRestricted: firstVendorProduct.isAgeRestricted,
          attributes: firstVendorProduct.attributes,
          meta: firstVendorProduct.meta,
          isPerishable: firstVendorProduct.isPerishable,
          categoryIds: firstVendorProduct.categories.map((c) => c.id),
          tagIds: firstVendorProduct.tags.map((t) => t.id),
        };

        // 4. Save the updated base product
        await productModel.updateProductBase(updatePayload);
        updatedCount++;
        console.log(`Successfully updated product ${product.id} ('${product.name}') with data from vendor product ${firstVendorProduct.id}.`);
      } else {
        console.log(`Skipping product ${product.id} ('${product.name}'): No associated vendor products found.`);
        skippedCount++;
      }
    } catch (error: any) {
      console.error(`Failed to process product ${product.id}: ${error.message}`);
      errors.push({ productId: product.id, error: error.message });
      skippedCount++;
    }
  }

  const summary = `Backfill complete. Updated: ${updatedCount}, Skipped: ${skippedCount}, Errors: ${errors.length}.`;
  console.log(summary);
  if (errors.length > 0) {
    console.error('Errors occurred for the following products:', errors);
  }
  return { message: summary, updated: updatedCount, skipped: skippedCount, errors };
};