-- CreateEnum
CREATE TYPE "ReplacementPreference" AS ENUM ('dont_replace', 'send_request');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('imperial', 'metric');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "measurementUnit" "MeasurementUnit" NOT NULL DEFAULT 'metric',
ADD COLUMN     "replacementPreference" "ReplacementPreference" NOT NULL DEFAULT 'send_request';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "measurementUnit" "MeasurementUnit" NOT NULL DEFAULT 'metric',
ADD COLUMN     "replacementPreference" "ReplacementPreference" NOT NULL DEFAULT 'send_request';

-- CreateTable
CREATE TABLE "EmailVerification" (
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "purpose" TEXT NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("email")
);
