/*
  Warnings:

  - A unique constraint covering the columns `[name,address]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "isEbtEligible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isEbtEligible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VendorProduct" ADD COLUMN     "isEbtEligible" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_address_key" ON "Vendor"("name", "address");
