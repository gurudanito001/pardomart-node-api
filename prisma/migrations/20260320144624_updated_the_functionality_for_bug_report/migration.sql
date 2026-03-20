-- CreateEnum
CREATE TYPE "BugCategory" AS ENUM ('ORDER_ISSUE', 'PRODUCT_ISSUE', 'VENDOR_ISSUE', 'PAYMENT_ISSUE', 'APP_CRASH', 'APP_PERFORMANCE', 'UI_UX_ISSUE', 'ACCOUNT_ISSUE', 'OTHER');

-- AlterTable
ALTER TABLE "BugReport" ADD COLUMN     "category" "BugCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- CreateIndex
CREATE INDEX "BugReport_category_idx" ON "BugReport"("category");

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
