/*
  Warnings:

  - Added the required column `method` to the `Fee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeeCalculationMethod" AS ENUM ('flat', 'percentage', 'per_unit', 'per_distance');

-- AlterTable
ALTER TABLE "Fee" ADD COLUMN     "maxThreshold" DOUBLE PRECISION,
ADD COLUMN     "method" "FeeCalculationMethod" NOT NULL,
ADD COLUMN     "minThreshold" DOUBLE PRECISION,
ADD COLUMN     "thresholdAppliesTo" TEXT,
ADD COLUMN     "unit" TEXT;
