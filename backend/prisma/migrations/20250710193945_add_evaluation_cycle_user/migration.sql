/*
  Warnings:

  - You are about to drop the column `isSubmit` on the `EvaluationCycle` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `EvaluationCycle` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EvaluationCycleUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "submittedAt" DATETIME,
    "isSubmit" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EvaluationCycleUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvaluationCycleUser_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EvaluationCycle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COLLABORATOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_EvaluationCycle" ("createdAt", "endDate", "id", "name", "startDate", "status", "type") SELECT "createdAt", "endDate", "id", "name", "startDate", "status", "type" FROM "EvaluationCycle";
DROP TABLE "EvaluationCycle";
ALTER TABLE "new_EvaluationCycle" RENAME TO "EvaluationCycle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationCycleUser_userId_cycleId_key" ON "EvaluationCycleUser"("userId", "cycleId");
