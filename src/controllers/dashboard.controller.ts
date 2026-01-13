import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getStartDate = (timeframe: any): Date => {
    const now = new Date();
    let startDate = new Date();

    // Determine start date based on timeframe
    switch (timeframe) {
      case 'last7days':
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last1month':
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'last3months':
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last1year':
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default 30 days
        break;
    }
    return startDate;
};

/**
 * @swagger
 * /dashboard/cards:
 *   get:
 *     summary: Get dashboard card metrics (Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves total counts for users, stores, orders, and delivered orders.
 *     responses:
 *       200:
 *         description: Dashboard card data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers: { type: integer }
 *                     totalStores: { type: integer }
 *                     totalOrders: { type: integer }
 *                     totalDelivered: { type: integer }
 *       500:
 *         description: Internal server error.
 */
export const getDashboardCardsData = async (req: Request, res: Response) => {
  try {
    // 1. Fetch Cards Data (All Time Totals)
    const [totalUsers, totalStores, totalOrders, totalDelivered] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: { in: ['delivered', 'picked_up_by_customer'] } } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalOrders,
        totalDelivered
      }
    });
  } catch (error) {
    console.error('Get Dashboard Cards Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch cards data' });
  }
};

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics for a timeframe (Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves statistics like new customers, new stores, stock status, items sold, and revenue for a specific timeframe.
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [last7days, 7d, last1month, 1m, last3months, 3m, last1year, 1y]
 *           default: last1month
 *         description: The timeframe for the statistics.
 *     responses:
 *       200:
 *         description: Dashboard statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeframe: { type: string }
 *                     customers: { type: integer }
 *                     newStores: { type: integer }
 *                     stockProducts: { type: integer }
 *                     outOfStock: { type: integer }
 *                     numOfItemsSold: { type: integer }
 *                     revenue: { type: number }
 *       500:
 *         description: Internal server error.
 */
export const getDashboardTimeframeStats = async (req: Request, res: Response) => {
  try {
    const { timeframe } = req.query;
    const startDate = getStartDate(timeframe);

    const [
      newCustomers,
      newStores,
      stockProducts,
      outOfStock,
      ordersInTimeframe
    ] = await Promise.all([
      // Customers (New users in timeframe)
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      
      // Total stores (New stores in timeframe)
      prisma.vendor.count({ where: { createdAt: { gte: startDate } } }),
      
      // Stock products (Current snapshot of products with stock > 0)
      // Assuming 'vendorProduct' is the model. Using 'any' to avoid strict type errors if model name varies.
      (prisma as any).vendorProduct ? (prisma as any).vendorProduct.count({
        where: { isAvailable: true }
      }) : 0,
      
      // Out of stock (Current snapshot of products with stock <= 0)
      (prisma as any).vendorProduct ? (prisma as any).vendorProduct.count({ where: { isAvailable: false } }) : 0,
      
      // Orders for Revenue, Items Sold, and AOV calculations
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          orderStatus: { not: "cancelled_by_customer" }
        },
        include: {
          orderItems: true
        }
      })
    ]);

    // Calculate Revenue and Num of Items Sold from fetched orders
    let revenue = 0;
    let numOfItemsSold = 0;

    ordersInTimeframe.forEach((order: any) => {
      revenue += Number(order.totalAmount) || 0;
      
      // Handle potential relation names (orderItems or items)
      const items = order.orderItems || order.items || [];
      items.forEach((item: any) => {
        numOfItemsSold += (item.quantity || 0);
      });
    });

    res.status(200).json({
      success: true,
      data: {
        timeframe: timeframe || 'last1month',
        customers: newCustomers,
        newStores: newStores,
        stockProducts, // Current snapshot
        outOfStock,    // Current snapshot
        numOfItemsSold,
        revenue
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch timeframe stats' });
  }
};

/**
 * @swagger
 * /dashboard/transactions:
 *   get:
 *     summary: Get recent transactions (Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a list of recent transactions within the specified timeframe.
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [last7days, 7d, last1month, 1m, last3months, 3m, last1year, 1y]
 *           default: last1month
 *         description: The timeframe filter.
 *     responses:
 *       200:
 *         description: Recent transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Internal server error.
 */
export const getDashboardRecentTransactions = async (req: Request, res: Response) => {
  try {
    const { timeframe } = req.query;
    const startDate = getStartDate(timeframe);

    const recentTransactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: recentTransactions
    });
  } catch (error) {
    console.error('Get Dashboard Transactions Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch recent transactions' });
  }
};

/**
 * @swagger
 * /dashboard/aov:
 *   get:
 *     summary: Get average order value (Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Calculates the average order value for the specified timeframe.
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [last7days, 7d, last1month, 1m, last3months, 3m, last1year, 1y]
 *           default: last1month
 *         description: The timeframe filter.
 *     responses:
 *       200:
 *         description: Average order value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageOrderValue: { type: number }
 *                     timeframe: { type: string }
 *       500:
 *         description: Internal server error.
 */
export const getDashboardAverageOrderValue = async (req: Request, res: Response) => {
  try {
    const { timeframe } = req.query;
    const startDate = getStartDate(timeframe);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        orderStatus: { not: 'cancelled_by_customer' }
      },
      select: { totalAmount: true }
    });

    let revenue = 0;
    orders.forEach((order: any) => {
      revenue += Number(order.totalAmount) || 0;
    });

    const averageOrderValue = orders.length > 0 ? revenue / orders.length : 0;

    res.status(200).json({ success: true, data: { averageOrderValue, timeframe: timeframe || 'last1month' } });
  } catch (error) {
    console.error('Get Dashboard AOV Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch average order value' });
  }
};
