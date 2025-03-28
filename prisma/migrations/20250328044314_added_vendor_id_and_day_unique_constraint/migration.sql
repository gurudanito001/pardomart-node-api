/*
  Warnings:

  - A unique constraint covering the columns `[vendorId,day]` on the table `VendorOpeningHours` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VendorOpeningHours_vendorId_day_key" ON "VendorOpeningHours"("vendorId", "day");
