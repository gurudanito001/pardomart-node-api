-- CreateTable
CREATE TABLE "DeliveryPersonLocation" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "DeliveryPersonLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryPersonLocation_orderId_createdAt_idx" ON "DeliveryPersonLocation"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "DeliveryPersonLocation" ADD CONSTRAINT "DeliveryPersonLocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
