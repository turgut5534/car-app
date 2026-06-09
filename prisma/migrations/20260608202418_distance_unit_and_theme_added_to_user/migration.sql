-- AlterTable
ALTER TABLE "User" ADD COLUMN     "distanceUnit" TEXT NOT NULL DEFAULT 'km',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';
