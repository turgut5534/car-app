/*
  Warnings:

  - Made the column `km` on table `FuelRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FuelRecord" ALTER COLUMN "km" SET NOT NULL,
ALTER COLUMN "km" SET DEFAULT 0;
