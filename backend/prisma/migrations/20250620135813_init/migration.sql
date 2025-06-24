-- CreateTable
CREATE TABLE "UserRole" (
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("userId", "role"),
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PeerEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluatorId" INTEGER NOT NULL,
    "evaluateeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    CONSTRAINT "PeerEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PeerEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentorEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluatorId" INTEGER NOT NULL,
    "evaluateeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    CONSTRAINT "MentorEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentorEvaluation_evaluateeId_fkey" FOREIGN KEY ("evaluateeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "providerId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justification" TEXT NOT NULL,
    CONSTRAINT "Reference_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reference_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
