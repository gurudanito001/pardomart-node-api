/*
  Warnings:

  - A unique constraint covering the columns `[vendorId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "vendorId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_vendorId_key" ON "Wallet"("vendorId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
