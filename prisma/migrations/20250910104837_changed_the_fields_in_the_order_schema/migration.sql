/*
  Warnings:

  - You are about to drop the column `deliveryHandlerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledShoppingStartTime` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shoppingHandlerId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_deliveryHandlerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shoppingHandlerId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryHandlerId",
DROP COLUMN "scheduledShoppingStartTime",
DROP COLUMN "shoppingHandlerId",
ADD COLUMN     "deliveryPersonId" TEXT,
ADD COLUMN     "shopperId" TEXT,
ADD COLUMN     "shoppingStartTime" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopperId_fkey" FOREIGN KEY ("shopperId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryPersonId_fkey" FOREIGN KEY ("deliveryPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
