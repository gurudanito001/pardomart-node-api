-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('ORDER', 'SUPPORT', 'SYSTEM', 'PROMOTION');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "category" "NotificationCategory" NOT NULL DEFAULT 'ORDER';
