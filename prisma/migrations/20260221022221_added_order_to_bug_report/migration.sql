-- AlterTable
ALTER TABLE "BugReport" ADD COLUMN     "orderId" TEXT;

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
