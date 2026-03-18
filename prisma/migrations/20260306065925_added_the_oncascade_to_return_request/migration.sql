-- DropForeignKey
ALTER TABLE "ReturnRequest" DROP CONSTRAINT "ReturnRequest_orderId_fkey";

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
