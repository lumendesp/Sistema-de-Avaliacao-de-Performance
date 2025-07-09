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
INSERT INTO "new_EvaluationCycle" ("endDate", "id", "name", "startDate", "status") SELECT "endDate", "id", "name", "startDate", "status" FROM "EvaluationCycle";
DROP TABLE "EvaluationCycle";
ALTER TABLE "new_EvaluationCycle" RENAME TO "EvaluationCycle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
