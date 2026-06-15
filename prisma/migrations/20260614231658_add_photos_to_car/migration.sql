-- CreateTable
CREATE TABLE "CarPhotos" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "url" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarPhotos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarPhotos" ADD CONSTRAINT "CarPhotos_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
