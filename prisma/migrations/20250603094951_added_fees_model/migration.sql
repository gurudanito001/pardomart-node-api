-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('DELIVERY', 'SERVICE');

-- CreateTable
CREATE TABLE "Fee" (
    "id" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fee_type_isActive_key" ON "Fee"("type", "isActive");
