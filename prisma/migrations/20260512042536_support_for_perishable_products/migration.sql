/*
  Warnings:

  - Made the column `longitude` on table `Vendor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latitude` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPerishable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "longitude" SET NOT NULL,
ALTER COLUMN "latitude" SET NOT NULL;

-- AlterTable
ALTER TABLE "VendorProduct" ADD COLUMN     "isPerishable" BOOLEAN NOT NULL DEFAULT false;
