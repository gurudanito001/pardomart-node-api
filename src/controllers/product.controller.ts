


// controllers/product.controller.ts
import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { Prisma } from '@prisma/client';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.createVendorProduct(req.body);
    res.status(201).json(vendorProduct);
  } catch (error) {
    console.error('Error creating vendor product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

export const updateProductBase = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProductBase({ id: req.params.id, ...req.body });
    res.json(product);
  } catch (error) {
    console.error('Error updating product base:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.updateVendorProduct({ id: req.params.id, ...req.body });
    res.json(vendorProduct);
  } catch (error) {
    console.error('Error updating vendor product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting all products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllVendorProducts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ error: 'vendorId is required' });
    }
    const vendorProducts = await productService.getAllVendorProducts(vendorId as string);
    res.json(vendorProducts);
  } catch (error) {
    console.error('Error getting vendor products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.json(product);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVendorProduct = async (req: Request, res: Response) => {
  try {
    const vendorProduct = await productService.deleteVendorProduct(req.params.id);
    res.json(vendorProduct);
  } catch (error) {
    console.error('Error deleting vendor product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};