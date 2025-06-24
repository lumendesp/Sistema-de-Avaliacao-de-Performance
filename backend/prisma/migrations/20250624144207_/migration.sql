-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AiSummary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "AiSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AiSummary_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AiSummary" ("cycleId", "id", "text", "userId") SELECT "cycleId", "id", "text", "userId" FROM "AiSummary";
DROP TABLE "AiSummary";
ALTER TABLE "new_AiSummary" RENAME TO "AiSummary";
CREATE TABLE "new_CommitteeRemark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "CommitteeRemark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommitteeRemark_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CommitteeRemark" ("cycleId", "id", "text", "userId") SELECT "cycleId", "id", "text", "userId" FROM "CommitteeRemark";
DROP TABLE "CommitteeRemark";
ALTER TABLE "new_CommitteeRemark" RENAME TO "CommitteeRemark";
CREATE TABLE "new_Discrepancy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    CONSTRAINT "Discrepancy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Discrepancy_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Discrepancy" ("cycleId", "details", "id", "type", "userId") SELECT "cycleId", "details", "id", "type", "userId" FROM "Discrepancy";
DROP TABLE "Discrepancy";
ALTER TABLE "new_Discrepancy" RENAME TO "Discrepancy";
CREATE TABLE "new_FinalScore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "executionScore" REAL,
    "postureScore" REAL,
    "finalScore" REAL,
    "summary" TEXT,
    "adjustedBy" INTEGER,
    "justification" TEXT NOT NULL,
    CONSTRAINT "FinalScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FinalScore_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FinalScore_adjustedBy_fkey" FOREIGN KEY ("adjustedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FinalScore" ("adjustedBy", "cycleId", "executionScore", "finalScore", "id", "justification", "postureScore", "summary", "userId") SELECT "adjustedBy", "cycleId", "executionScore", "finalScore", "id", "justification", "postureScore", "summary", "userId" FROM "FinalScore";
DROP TABLE "FinalScore";
ALTER TABLE "new_FinalScore" RENAME TO "FinalScore";
CREATE TABLE "new_ManagerEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluatorId" INTEGER NOT NULL,
    "evaluateeId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManagerEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ManagerEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ManagerEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ManagerEvaluation" ("createdAt", "cycleId", "evaluateeId", "evaluatorId", "id") SELECT "createdAt", "cycleId", "evaluateeId", "evaluatorId", "id" FROM "ManagerEvaluation";
DROP TABLE "ManagerEvaluation";
ALTER TABLE "new_ManagerEvaluation" RENAME TO "ManagerEvaluation";
CREATE TABLE "new_MentorEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluatorId" INTEGER NOT NULL,
    "evaluateeId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    CONSTRAINT "MentorEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentorEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentorEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MentorEvaluation" ("createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "justification", "score") SELECT "createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "justification", "score" FROM "MentorEvaluation";
DROP TABLE "MentorEvaluation";
ALTER TABLE "new_MentorEvaluation" RENAME TO "MentorEvaluation";
CREATE TABLE "new_PeerEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluatorId" INTEGER NOT NULL,
    "evaluateeId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" REAL NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "motivation" TEXT,
    CONSTRAINT "PeerEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PeerEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PeerEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PeerEvaluation" ("createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "improvements", "motivation", "score", "strengths") SELECT "createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "improvements", "motivation", "score", "strengths" FROM "PeerEvaluation";
DROP TABLE "PeerEvaluation";
ALTER TABLE "new_PeerEvaluation" RENAME TO "PeerEvaluation";
CREATE TABLE "new_Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "providerId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justification" TEXT NOT NULL,
    CONSTRAINT "Reference_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reference_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reference_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reference" ("createdAt", "cycleId", "id", "justification", "providerId", "receiverId") SELECT "createdAt", "cycleId", "id", "justification", "providerId", "receiverId" FROM "Reference";
DROP TABLE "Reference";
ALTER TABLE "new_Reference" RENAME TO "Reference";
CREATE TABLE "new_SelfEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criterionId" INTEGER,
    CONSTRAINT "SelfEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SelfEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SelfEvaluation_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SelfEvaluation" ("createdAt", "criterionId", "cycleId", "id", "userId") SELECT "createdAt", "criterionId", "cycleId", "id", "userId" FROM "SelfEvaluation";
DROP TABLE "SelfEvaluation";
ALTER TABLE "new_SelfEvaluation" RENAME TO "SelfEvaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
