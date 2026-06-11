/*
  Warnings:

  - The `fuelType` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'LPG', 'ELECTRIC');

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" "FuelType" NOT NULL DEFAULT 'PETROL';
