/*
  Warnings:

  - Added the required column `currency` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `FuelRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `ServiceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "convertedAmount" DOUBLE PRECISION,
ADD COLUMN     "convertedCurrency" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FuelRecord" ADD COLUMN     "convertedAmount" DOUBLE PRECISION,
ADD COLUMN     "convertedCurrency" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceRecord" ADD COLUMN     "convertedAmount" DOUBLE PRECISION,
ADD COLUMN     "convertedCurrency" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL;
