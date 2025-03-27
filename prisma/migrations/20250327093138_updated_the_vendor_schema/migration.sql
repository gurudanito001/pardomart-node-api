/*
  Warnings:

  - You are about to drop the column `area` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFee` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `favouriteCount` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `isFavourite` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `mediaurls` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `minimumOrder` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `ratings` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `ratingsCount` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VendorCategories` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_VendorCategories" DROP CONSTRAINT "_VendorCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_VendorCategories" DROP CONSTRAINT "_VendorCategories_B_fkey";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "area",
DROP COLUMN "deliveryFee",
DROP COLUMN "favouriteCount",
DROP COLUMN "isFavourite",
DROP COLUMN "mediaurls",
DROP COLUMN "minimumOrder",
DROP COLUMN "ratings",
DROP COLUMN "ratingsCount",
ADD COLUMN     "image" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "_VendorCategories";
