-- CreateTable
CREATE TABLE "FuelAttachment" (
    "id" TEXT NOT NULL,
    "fuelRecordId" TEXT NOT NULL,
    "url" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FuelAttachment" ADD CONSTRAINT "FuelAttachment_fuelRecordId_fkey" FOREIGN KEY ("fuelRecordId") REFERENCES "FuelRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
