-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'text';
