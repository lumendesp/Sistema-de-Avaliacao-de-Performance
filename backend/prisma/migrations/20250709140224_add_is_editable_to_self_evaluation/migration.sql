-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MentorEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluatorId" INTEGER NOT NULL,
    "evaluateeId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MentorEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentorEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentorEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MentorEvaluation" ("createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "justification", "score", "submittedAt") SELECT "createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "justification", "score", "submittedAt" FROM "MentorEvaluation";
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
    "submittedAt" DATETIME,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PeerEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PeerEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PeerEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PeerEvaluation" ("createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "improvements", "motivation", "score", "strengths", "submittedAt") SELECT "createdAt", "cycleId", "evaluateeId", "evaluatorId", "id", "improvements", "motivation", "score", "strengths", "submittedAt" FROM "PeerEvaluation";
DROP TABLE "PeerEvaluation";
ALTER TABLE "new_PeerEvaluation" RENAME TO "PeerEvaluation";
CREATE TABLE "new_Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "providerId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justification" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Reference_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reference_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reference_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reference" ("createdAt", "cycleId", "id", "justification", "providerId", "receiverId", "submittedAt") SELECT "createdAt", "cycleId", "id", "justification", "providerId", "receiverId", "submittedAt" FROM "Reference";
DROP TABLE "Reference";
ALTER TABLE "new_Reference" RENAME TO "Reference";
CREATE TABLE "new_SelfEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    "averageScore" REAL,
    CONSTRAINT "SelfEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SelfEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "EvaluationCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SelfEvaluation" ("averageScore", "createdAt", "cycleId", "id", "submittedAt", "userId") SELECT "averageScore", "createdAt", "cycleId", "id", "submittedAt", "userId" FROM "SelfEvaluation";
DROP TABLE "SelfEvaluation";
ALTER TABLE "new_SelfEvaluation" RENAME TO "SelfEvaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
