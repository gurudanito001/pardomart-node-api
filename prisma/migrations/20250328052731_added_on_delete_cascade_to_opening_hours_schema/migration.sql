-- DropForeignKey
ALTER TABLE "VendorOpeningHours" DROP CONSTRAINT "VendorOpeningHours_vendorId_fkey";

-- AddForeignKey
ALTER TABLE "VendorOpeningHours" ADD CONSTRAINT "VendorOpeningHours_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
