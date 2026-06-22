/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Family` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Family_ownerId_key" ON "Family"("ownerId");
