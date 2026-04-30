-- CreateEnum
CREATE TYPE "RefundType" AS ENUM ('FULL_REVERSAL', 'PARTIAL_REFUND');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "refundType" "RefundType";
