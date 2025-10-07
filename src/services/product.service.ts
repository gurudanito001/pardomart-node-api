// services/product.service.ts
import { Prisma, VendorProduct } from '@prisma/client';
import * as productModel from '../models/product.model';
import * as vendorModel from '../models/vendor.model';
import { uploadMedia } from './media.service';
import { v4 as uuidv4 } from 'uuid';

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
      return uploadResult.secure_url;
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

  // 2. Generate a new UUID for the vendor product.
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

  // 3. Generate a new UUID for the vendor product.
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
export const deleteVendorProduct = (id: string) => productModel.deleteVendorProduct(id);
export const getTrendingVendorProductsService = (filters: any, pagination: any) => productModel.getTrendingVendorProducts(filters, pagination);