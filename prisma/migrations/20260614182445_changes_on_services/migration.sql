/*
  Warnings:

  - Made the column `km` on table `ServiceRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServiceRecord" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "amount" DROP DEFAULT,
ALTER COLUMN "km" SET NOT NULL;
