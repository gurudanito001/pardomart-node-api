-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pickupOtp" TEXT,
ADD COLUMN     "pickupOtpVerifiedAt" TIMESTAMP(3);
