-- AlterTable
ALTER TABLE "VendorProduct" ADD COLUMN     "meta" JSONB,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
