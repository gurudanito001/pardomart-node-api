-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "requestMethod" TEXT,
    "requestPath" TEXT,
    "statusCode" INTEGER NOT NULL,
    "errorCode" TEXT,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- CreateIndex
CREATE INDEX "ErrorLog_statusCode_idx" ON "ErrorLog"("statusCode");

-- CreateIndex
CREATE INDEX "ErrorLog_correlationId_idx" ON "ErrorLog"("correlationId");
