-- AlterTable
ALTER TABLE "SelfEvaluation" ADD COLUMN "averageScore" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SelfEvaluationItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluationId" INTEGER NOT NULL,
    "criterionId" INTEGER NOT NULL,
    "configuredCriterionId" INTEGER,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "scoreDescription" TEXT,
    CONSTRAINT "SelfEvaluationItem_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "SelfEvaluation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SelfEvaluationItem_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SelfEvaluationItem_configuredCriterionId_fkey" FOREIGN KEY ("configuredCriterionId") REFERENCES "ConfiguredCriterion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SelfEvaluationItem" ("criterionId", "evaluationId", "id", "justification", "score", "scoreDescription") SELECT "criterionId", "evaluationId", "id", "justification", "score", "scoreDescription" FROM "SelfEvaluationItem";
DROP TABLE "SelfEvaluationItem";
ALTER TABLE "new_SelfEvaluationItem" RENAME TO "SelfEvaluationItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
