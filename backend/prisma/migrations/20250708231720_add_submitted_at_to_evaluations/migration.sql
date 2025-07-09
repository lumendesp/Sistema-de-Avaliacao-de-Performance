/*
  Warnings:

  - A unique constraint covering the columns `[userId,cycleId]` on the table `AISummary` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MentorEvaluation" ADD COLUMN "submittedAt" DATETIME;

-- AlterTable
ALTER TABLE "PeerEvaluation" ADD COLUMN "submittedAt" DATETIME;

-- AlterTable
ALTER TABLE "Reference" ADD COLUMN "submittedAt" DATETIME;

-- AlterTable
ALTER TABLE "SelfEvaluation" ADD COLUMN "submittedAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "AISummary_userId_cycleId_key" ON "AISummary"("userId", "cycleId");
