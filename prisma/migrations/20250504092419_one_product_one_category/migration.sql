/*
  Warnings:

  - You are about to drop the column `categoryIds` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `categoryIds` on the `VendorProduct` table. All the data in the column will be lost.
  - You are about to drop the `_CategoryToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToVendorProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `VendorProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToVendorProduct" DROP CONSTRAINT "_CategoryToVendorProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToVendorProduct" DROP CONSTRAINT "_CategoryToVendorProduct_B_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryIds",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VendorProduct" DROP COLUMN "categoryIds",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_CategoryToProduct";

-- DropTable
DROP TABLE "_CategoryToVendorProduct";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProduct" ADD CONSTRAINT "VendorProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
