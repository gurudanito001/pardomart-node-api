-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "instructions" TEXT;

-- CreateTable
CREATE TABLE "_replacementFor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_replacementFor_AB_unique" ON "_replacementFor"("A", "B");

-- CreateIndex
CREATE INDEX "_replacementFor_B_index" ON "_replacementFor"("B");

-- AddForeignKey
ALTER TABLE "_replacementFor" ADD CONSTRAINT "_replacementFor_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_replacementFor" ADD CONSTRAINT "_replacementFor_B_fkey" FOREIGN KEY ("B") REFERENCES "VendorProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
