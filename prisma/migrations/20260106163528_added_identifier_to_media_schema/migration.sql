-- CreateEnum
CREATE TYPE "Identifier" AS ENUM ('profile_picture', 'document_scan', 'product_image', 'category_image', 'ad_image', 'business_document_1', 'business_document_2', 'other');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "identifier" "Identifier";
