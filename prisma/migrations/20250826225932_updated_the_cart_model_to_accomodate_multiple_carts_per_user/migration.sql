/*
  Warnings:

  - A unique constraint covering the columns `[userId,vendorId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vendorId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "vendorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_vendorId_key" ON "Cart"("userId", "vendorId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
