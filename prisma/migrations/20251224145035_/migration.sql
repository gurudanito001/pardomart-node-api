/*
  Warnings:

  - The values [ADMIN] on the enum `NotificationCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationCategory_new" AS ENUM ('ORDER', 'SUPPORT', 'SYSTEM', 'PROMOTION');
ALTER TABLE "Notification" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "category" TYPE "NotificationCategory_new" USING ("category"::text::"NotificationCategory_new");
ALTER TYPE "NotificationCategory" RENAME TO "NotificationCategory_old";
ALTER TYPE "NotificationCategory_new" RENAME TO "NotificationCategory";
DROP TYPE "NotificationCategory_old";
ALTER TABLE "Notification" ALTER COLUMN "category" SET DEFAULT 'ORDER';
COMMIT;
