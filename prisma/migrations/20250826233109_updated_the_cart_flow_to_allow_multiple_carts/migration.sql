/*
  Warnings:

  - A unique constraint covering the columns `[cartId,vendorProductId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Made the column `cartId` on table `CartItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "cartId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_vendorProductId_key" ON "CartItem"("cartId", "vendorProductId");
