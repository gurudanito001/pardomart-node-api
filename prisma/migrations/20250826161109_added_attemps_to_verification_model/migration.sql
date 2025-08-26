-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "weightUnit" TEXT;

-- AlterTable
ALTER TABLE "VendorProduct" ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "weightUnit" TEXT;

-- AlterTable
ALTER TABLE "Verification" ADD COLUMN     "attempts" INTEGER DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
