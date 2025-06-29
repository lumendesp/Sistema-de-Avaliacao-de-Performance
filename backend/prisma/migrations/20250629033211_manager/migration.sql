/*
  Warnings:

  - Added the required column `groupId` to the `ManagerEvaluationItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ManagerEvaluationItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluationId" INTEGER NOT NULL,
    "criterionId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "scoreDescription" TEXT,
    "groupId" INTEGER NOT NULL,
    CONSTRAINT "ManagerEvaluationItem_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "ManagerEvaluation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ManagerEvaluationItem_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ManagerEvaluationItem" ("criterionId", "evaluationId", "id", "justification", "score", "scoreDescription") SELECT "criterionId", "evaluationId", "id", "justification", "score", "scoreDescription" FROM "ManagerEvaluationItem";
DROP TABLE "ManagerEvaluationItem";
ALTER TABLE "new_ManagerEvaluationItem" RENAME TO "ManagerEvaluationItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
