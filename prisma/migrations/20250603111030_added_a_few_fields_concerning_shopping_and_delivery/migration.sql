/*
  Warnings:

  - You are about to drop the column `scheduledDeliveryTime` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShoppingMethod" AS ENUM ('VENDOR', 'SHOPPER');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('DELIVERY_PERSON', 'CUSTOMER_PICKUP');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'ready_for_pickup';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "scheduledDeliveryTime",
ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'CUSTOMER_PICKUP',
ADD COLUMN     "scheduledShoppingStartTime" TIMESTAMP(3),
ADD COLUMN     "shoppingMethod" "ShoppingMethod" NOT NULL DEFAULT 'VENDOR';
