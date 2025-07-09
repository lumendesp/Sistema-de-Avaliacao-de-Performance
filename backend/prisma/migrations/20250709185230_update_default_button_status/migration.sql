-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EvaluationCycle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "isSubmit" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_EvaluationCycle" ("endDate", "id", "isSubmit", "name", "startDate", "status", "submittedAt") SELECT "endDate", "id", "isSubmit", "name", "startDate", "status", "submittedAt" FROM "EvaluationCycle";
DROP TABLE "EvaluationCycle";
ALTER TABLE "new_EvaluationCycle" RENAME TO "EvaluationCycle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
