/*
  Warnings:

  - The values [DELIVERY_PERSON,CUSTOMER_PICKUP] on the enum `DeliveryMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [DELIVERY,SERVICE] on the enum `FeeType` will be removed. If these variants are still used in the database, this will fail.
  - The values [vendor] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [VENDOR,SHOPPER] on the enum `ShoppingMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryMethod_new" AS ENUM ('delivery_person', 'customer_pickup');
ALTER TABLE "Order" ALTER COLUMN "deliveryMethod" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "deliveryMethod" TYPE "DeliveryMethod_new" USING ("deliveryMethod"::text::"DeliveryMethod_new");
ALTER TYPE "DeliveryMethod" RENAME TO "DeliveryMethod_old";
ALTER TYPE "DeliveryMethod_new" RENAME TO "DeliveryMethod";
DROP TYPE "DeliveryMethod_old";
ALTER TABLE "Order" ALTER COLUMN "deliveryMethod" SET DEFAULT 'customer_pickup';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "FeeType_new" AS ENUM ('delivery', 'service');
ALTER TABLE "Fee" ALTER COLUMN "type" TYPE "FeeType_new" USING ("type"::text::"FeeType_new");
ALTER TYPE "FeeType" RENAME TO "FeeType_old";
ALTER TYPE "FeeType_new" RENAME TO "FeeType";
DROP TYPE "FeeType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'vendor_admin', 'shopper_staff', 'delivery', 'customer', 'shopper');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ShoppingMethod_new" AS ENUM ('vendor', 'shopper');
ALTER TABLE "Order" ALTER COLUMN "shoppingMethod" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "shoppingMethod" TYPE "ShoppingMethod_new" USING ("shoppingMethod"::text::"ShoppingMethod_new");
ALTER TYPE "ShoppingMethod" RENAME TO "ShoppingMethod_old";
ALTER TYPE "ShoppingMethod_new" RENAME TO "ShoppingMethod";
DROP TYPE "ShoppingMethod_old";
ALTER TABLE "Order" ALTER COLUMN "shoppingMethod" SET DEFAULT 'vendor';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "reasonForDecline" TEXT,
ALTER COLUMN "deliveryMethod" SET DEFAULT 'customer_pickup',
ALTER COLUMN "shoppingMethod" SET DEFAULT 'vendor';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vendorId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
