-- CreateEnum
CREATE TYPE "Days" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateTable
CREATE TABLE "VendorOpeningHours" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "day" "Days" NOT NULL,
    "open" TEXT,
    "close" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorOpeningHours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VendorOpeningHours" ADD CONSTRAINT "VendorOpeningHours_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
