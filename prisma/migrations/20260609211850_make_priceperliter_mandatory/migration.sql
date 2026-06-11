/*
  Warnings:

  - Made the column `pricePerLiter` on table `FuelRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FuelRecord" ALTER COLUMN "pricePerLiter" SET NOT NULL;
