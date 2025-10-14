// services/product.service.ts
import { Prisma, VendorProduct, Role } from '@prisma/client';
import * as productModel from '../models/product.model';
import * as vendorModel from '../models/vendor.model';
import { uploadMedia } from './media.service';

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

  return productModel.createVendorProduct(finalPayload);
};

// Keep other service functions from the original file if they exist.
// For this example, I'm only adding the createVendorProduct service.
// The following are placeholders for other functions from your controller.

export const createProduct = (payload: any) => productModel.createProduct(payload);
export const getVendorProductById = (id: string) => productModel.getVendorProductById(id);

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

  const { images, barcode, ...productData } = payload;
  let productId: string;

  // 2. Find or create the base product
  const existingProduct = await productModel.getProductByBarcode(payload.barcode);

  if (!existingProduct) {
    const newProduct = await productModel.createProduct({
      barcode: payload.barcode,
      name: payload.name || 'Default Product Name',
      description: payload.description,
      images: [], // Images will be handled for the VendorProduct
      attributes: payload.attributes,
      categoryIds: payload.categoryIds || [],
      tagIds: payload.tagIds || [],
    });
    productId = newProduct.id;
  } else {
    productId = existingProduct.id;
  }

  // 3. Generate a new UUID for the vendor product using dynamic import.
  const { v4: uuidv4 } = await import('uuid');
  const vendorProductId = uuidv4();

  // 4. Upload images to Cloudinary
  let processedImageUrls: string[] = [];
  if (images && images.length > 0) {
    processedImageUrls = await uploadImages(images, vendorProductId);
  }

  // 5. Create the VendorProduct with the processed image URLs
  const vendorProductPayload: productModel.CreateVendorProductPayload = {
    ...productData,
    id: vendorProductId, // Use the pre-generated ID
    productId: productId,
    images: processedImageUrls,
  };

  return productModel.createVendorProduct(vendorProductPayload);
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
  return productModel.getVendorProductsByOwnerId(ownerId, vendorId, pagination);
};


export const getProductByBarcode = (barcode: string) => productModel.getProductByBarcode(barcode);
export const getVendorProductByBarcode = (barcode: string, vendorId: string) => productModel.getVendorProductByBarcode(barcode, vendorId);
export const getProductsByTagIds = (tagIds: string[]) => productModel.getProductsByTagIds(tagIds);
export const getVendorProductsByTagIds = (tagIds: string[]) => productModel.getVendorProductsByTagIds(tagIds);
export const updateProductBase = (payload: any) => productModel.updateProductBase(payload);
export const updateVendorProduct = (payload: any) => productModel.updateVendorProduct(payload);
export const getAllProducts = () => productModel.getAllProducts();
export const getAllVendorProducts = (filters: any, pagination: any) => productModel.getAllVendorProducts(filters, pagination);
export const getVendorProductsByCategory = (vendorId: string, categoryId: string) => productModel.getVendorProductsByCategory(vendorId, categoryId);
export const getVendorProductsByUser = (userId: string) => productModel.getVendorProductsByUserId(userId);
export const deleteProduct = (id: string) => productModel.deleteProduct(id);
export const getTrendingVendorProductsService = (filters: any, pagination: any) => productModel.getTrendingVendorProducts(filters, pagination);

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