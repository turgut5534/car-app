/*
  Warnings:

  - Made the column `fileName` on table `ServiceAttachment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServiceAttachment" ALTER COLUMN "fileName" SET NOT NULL;
