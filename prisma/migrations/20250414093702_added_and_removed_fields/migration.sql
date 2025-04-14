/*
  Warnings:

  - You are about to drop the column `sku` on the `VendorProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isAgeRestricted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAlcohol" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VendorProduct" DROP COLUMN "sku",
ADD COLUMN     "isAgeRestricted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAlcohol" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToVendorProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToTag_AB_unique" ON "_ProductToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToTag_B_index" ON "_ProductToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToVendorProduct_AB_unique" ON "_TagToVendorProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToVendorProduct_B_index" ON "_TagToVendorProduct"("B");

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD CONSTRAINT "_ProductToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD CONSTRAINT "_ProductToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToVendorProduct" ADD CONSTRAINT "_TagToVendorProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToVendorProduct" ADD CONSTRAINT "_TagToVendorProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "VendorProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
