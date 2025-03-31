/*
  Warnings:

  - Added the required column `updatedAt` to the `VendorProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VendorProduct" ADD COLUMN     "categoryIds" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "_CategoryToVendorProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToVendorProduct_AB_unique" ON "_CategoryToVendorProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToVendorProduct_B_index" ON "_CategoryToVendorProduct"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToVendorProduct" ADD CONSTRAINT "_CategoryToVendorProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToVendorProduct" ADD CONSTRAINT "_CategoryToVendorProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "VendorProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
