-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MentorToCollaboratorEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluatorId" INTEGER NOT NULL,
    "evaluateeId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    CONSTRAINT "MentorToCollaboratorEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentorToCollaboratorEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentorToCollaboratorEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MentorToCollaboratorEvaluation" ("createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "justification", "score") SELECT "createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "justification", "score" FROM "MentorToCollaboratorEvaluation";
DROP TABLE "MentorToCollaboratorEvaluation";
ALTER TABLE "new_MentorToCollaboratorEvaluation" RENAME TO "MentorToCollaboratorEvaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
