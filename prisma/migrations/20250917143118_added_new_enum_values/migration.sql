/*
  Warnings:

  - The values [shopper] on the enum `ShoppingMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_PLACED_CUSTOMER';

-- AlterEnum
BEGIN;
CREATE TYPE "ShoppingMethod_new" AS ENUM ('vendor', 'delivery_person');
ALTER TABLE "Order" ALTER COLUMN "shoppingMethod" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "shoppingMethod" TYPE "ShoppingMethod_new" USING ("shoppingMethod"::text::"ShoppingMethod_new");
ALTER TYPE "ShoppingMethod" RENAME TO "ShoppingMethod_old";
ALTER TYPE "ShoppingMethod_new" RENAME TO "ShoppingMethod";
DROP TYPE "ShoppingMethod_old";
ALTER TABLE "Order" ALTER COLUMN "shoppingMethod" SET DEFAULT 'vendor';
COMMIT;
