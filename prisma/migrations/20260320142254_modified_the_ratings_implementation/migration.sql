-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RatingType" ADD VALUE 'PRODUCT';
ALTER TYPE "RatingType" ADD VALUE 'ORDER';
ALTER TYPE "RatingType" ADD VALUE 'USER';

-- DropIndex
DROP INDEX "Rating_orderId_type_key";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "ratedProductId" TEXT,
ALTER COLUMN "orderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_ratedProductId_fkey" FOREIGN KEY ("ratedProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
