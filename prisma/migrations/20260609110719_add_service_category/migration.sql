/*
  Warnings:

  - Added the required column `category` to the `ServiceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('OIL_CHANGE', 'FILTER_CHANGE', 'BRAKE', 'TIRE', 'BATTERY', 'ENGINE', 'TRANSMISSION', 'SUSPENSION', 'AC', 'INSPECTION', 'WASH', 'OTHER');

-- AlterTable
ALTER TABLE "ServiceRecord" ADD COLUMN     "category" "ServiceCategory" NOT NULL;
