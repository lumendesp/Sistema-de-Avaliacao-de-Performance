/*
  Warnings:

  - A unique constraint covering the columns `[userId,cycleId]` on the table `AISummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AISummary_userId_cycleId_key" ON "AISummary"("userId", "cycleId");
