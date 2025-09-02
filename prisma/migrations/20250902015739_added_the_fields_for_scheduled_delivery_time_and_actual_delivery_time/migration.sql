-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "actualDeliveryTime" TIMESTAMP(3),
ADD COLUMN     "scheduledDeliveryTime" TIMESTAMP(3),
ALTER COLUMN "scheduledShoppingStartTime" DROP DEFAULT;
