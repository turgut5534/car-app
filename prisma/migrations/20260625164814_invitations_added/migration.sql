-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "FamilyInvitation" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "FamilyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FamilyInvitation_email_idx" ON "FamilyInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvitation_familyId_email_key" ON "FamilyInvitation"("familyId", "email");

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
