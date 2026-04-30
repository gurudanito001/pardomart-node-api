-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_SHOPPING_FAILED';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'no_items_found';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "reasonForNoItemsFound" TEXT;
