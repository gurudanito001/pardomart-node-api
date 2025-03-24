-- AlterTable
ALTER TABLE "Support" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "active" SET DEFAULT true;

-- CreateTable
CREATE TABLE "Verification" (
    "mobileNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("mobileNumber")
);

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
