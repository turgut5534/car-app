/*
  Warnings:

  - Made the column `currentKm` on table `Car` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "currentKm" SET NOT NULL,
ALTER COLUMN "currentKm" SET DEFAULT 0;
