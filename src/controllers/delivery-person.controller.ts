import { Request, Response } from 'express';
import * as deliveryPersonService from '../services/delivery-person.service';

/**
 * @swagger
 * tags:
 *   name: Delivery Persons
 *   description: Admin management of delivery persons
 */

/**
 * @swagger
 * /delivery-persons/admin/overview:
 *   get:
 *     summary: Get platform-wide delivery person overview data (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves aggregate data about delivery persons, such as total count, new sign-ups, and total deliveries. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: The number of past days to count for "new delivery persons".
 *     responses:
 *       200:
 *         description: An object containing the delivery person overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDeliveryPersons: { type: integer }
 *                 newDeliveryPersons: { type: integer }
 *                 totalDeliveries: { type: integer }
 *                 totalReturns: { type: integer }
 *       500:
 *         description: Internal server error.
 */
export const getAdminDeliveryPersonOverviewController = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
    const overviewData = await deliveryPersonService.getDeliveryPersonOverviewService(days);
    res.status(200).json(overviewData);
  } catch (error: any) {
    console.error('Error getting delivery person overview data:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};


/**
 * @swagger
 * /delivery-persons/admin/all:
 *   get:
 *     summary: Get a paginated list of all delivery persons (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves a paginated list of all users with the 'delivery_person' role. Allows filtering by name, status, number of deliveries, and creation date.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: "Search by name, email, or mobile number." }
 *       - { in: query, name: status, schema: { type: boolean }, description: "Filter by active status (true/false)." }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time }, description: "Filter users created on or after this date." }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time }, description: "Filter users created on or before this date." }
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of delivery persons.
 *       500:
 *         description: Internal server error.
 */
export const adminListAllDeliveryPersonsController = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      createdAtStart,
      createdAtEnd,
    } = req.query;

    const parseBoolean = (value: any): boolean | undefined => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    };

    const filters = {
      search: search as string | undefined,
      status: parseBoolean(status),
      createdAtStart: createdAtStart as string | undefined,
      createdAtEnd: createdAtEnd as string | undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.size as string) || 20;

    const result = await deliveryPersonService.adminListAllDeliveryPersonsService(filters, { page, take });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in adminListAllDeliveryPersonsController:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /delivery-persons/admin/export:
 *   get:
 *     summary: Export delivery persons to CSV (Admin)
 *     tags: [Delivery Persons, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: boolean } }
 *     responses:
 *       200:
 *         description: CSV file download.
 */
export const exportDeliveryPersonsController = async (req: Request, res: Response) => {
  try {
    const { search, status, createdAtStart, createdAtEnd } = req.query;
    const parseBoolean = (value: any): boolean | undefined => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    };
    const filters = {
      search: search as string | undefined,
      status: parseBoolean(status),
    };
    const csv = await deliveryPersonService.exportDeliveryPersonsService(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=delivery_persons.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /delivery-persons/admin/{id}:
 *   get:
 *     summary: Get a single delivery person's details (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves detailed information for a specific delivery person, including their profile, delivery statistics, and recent delivery history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery person to retrieve.
 *     responses:
 *       200:
 *         description: The delivery person's detailed information.
 *       404:
 *         description: Delivery person not found.
 *       500:
 *         description: Internal server error.
 */
export const adminGetDeliveryPersonDetailsByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deliveryPersonDetails = await deliveryPersonService.adminGetDeliveryPersonDetailsByIdService(id);

    if (!deliveryPersonDetails) {
      return res.status(404).json({ error: 'Delivery person not found.' });
    }

    res.status(200).json(deliveryPersonDetails);
  } catch (error: any) {
    console.error('Error in adminGetDeliveryPersonDetailsByIdController:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /delivery-persons/admin/{id}/deliveries:
 *   get:
 *     summary: Get a paginated delivery history for a single delivery person (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves a paginated list of all completed deliveries for a specific delivery person.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery person.
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of the delivery person's completed deliveries.
 *       404:
 *         description: Delivery person not found.
 *       500:
 *         description: Internal server error.
 */
export const adminGetDeliveryHistoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.size as string) || 20;

    // We can reuse the details service to quickly check if the delivery person exists
    const deliveryPerson = await deliveryPersonService.adminGetDeliveryPersonDetailsByIdService(id);
    if (!deliveryPerson) {
      return res.status(404).json({ error: 'Delivery person not found.' });
    }

    const history = await deliveryPersonService.adminGetDeliveryHistoryService(id, { page, take });
    res.status(200).json(history);
  } catch (error: any) {
    console.error('Error in adminGetDeliveryHistoryController:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /delivery-persons/admin/{id}:
 *   patch:
 *     summary: Update a delivery person's profile (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: >
 *       Allows an admin to update a delivery person's profile details.
 *       This is primarily used to suspend or reactivate an account by setting the `active` field to `false` or `true`.
 *       Other fields like `name`, `email`, etc., can also be updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery person to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *     responses:
 *       200:
 *         description: The updated delivery person profile.
 *       404:
 *         description: Delivery person not found.
 *       500:
 *         description: Internal server error.
 */
export const adminUpdateDeliveryPersonProfileController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await deliveryPersonService.adminUpdateDeliveryPersonProfileService(id, updates);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
  }
};
