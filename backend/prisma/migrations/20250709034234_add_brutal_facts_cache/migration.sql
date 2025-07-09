/*
  Warnings:

  - A unique constraint covering the columns `[userId,cycleId]` on the table `AISummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "BrutalFactsCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cycleId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BrutalFactsCache_cycleId_key" ON "BrutalFactsCache"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "AISummary_userId_cycleId_key" ON "AISummary"("userId", "cycleId");
