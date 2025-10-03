/*
  Warnings:

  - Changed the type of `referenceType` on the `Media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('user_image', 'store_image', 'product_image', 'category_image', 'document', 'other');

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "referenceType",
ADD COLUMN     "referenceType" "ReferenceType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE INDEX "Media_referenceId_referenceType_idx" ON "Media"("referenceId", "referenceType");
