-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "mobileVerified" BOOLEAN NOT NULL DEFAULT false;
