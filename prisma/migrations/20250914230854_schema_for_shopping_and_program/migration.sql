-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'FOUND', 'NOT_FOUND', 'REPLACED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "chosenReplacementId" TEXT,
ADD COLUMN     "isReplacementApproved" BOOLEAN,
ADD COLUMN     "quantityFound" INTEGER,
ADD COLUMN     "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_chosenReplacementId_fkey" FOREIGN KEY ("chosenReplacementId") REFERENCES "VendorProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
