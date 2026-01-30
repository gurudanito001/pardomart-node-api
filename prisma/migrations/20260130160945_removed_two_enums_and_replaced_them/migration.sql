/*
  Warnings:

  - The values [en_route_to_store,en_route_to_customer] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'accepted_for_shopping', 'accepted_for_delivery', 'currently_shopping', 'bagging_items', 'ready_for_pickup', 'ready_for_delivery', 'en_route_to_pickup', 'arrived_at_store', 'en_route_to_delivery', 'arrived_at_customer_location', 'en_route_to_return_pickup', 'arrived_at_return_pickup_location', 'en_route_to_return_to_store', 'returned_to_store', 'delivered', 'picked_up_by_customer', 'declined_by_vendor', 'cancelled_by_customer');
ALTER TABLE "Order" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "orderStatus" TYPE "OrderStatus_new" USING ("orderStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "orderStatus" SET DEFAULT 'pending';
COMMIT;
