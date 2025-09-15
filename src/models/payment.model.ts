/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *           format: float
 *         currency:
 *           type: string
 *           example: "usd"
 *         status:
 *           $ref: '#/components/schemas/PaymentStatus'
 *         userId:
 *           type: string
 *           format: uuid
 *         orderId:
 *           type: string
 *           format: uuid
 *         stripePaymentIntentId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     SavedPaymentMethod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         stripePaymentMethodId:
 *           type: string
 *         cardBrand:
 *           type: string
 *           example: "visa"
 *         cardLast4:
 *           type: string
 *           example: "4242"
 *         isDefault:
 *           type: boolean
 */
export {};