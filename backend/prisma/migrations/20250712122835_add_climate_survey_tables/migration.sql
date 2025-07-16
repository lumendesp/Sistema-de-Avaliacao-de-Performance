-- CreateTable
CREATE TABLE "ClimateSurvey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    CONSTRAINT "ClimateSurvey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClimateSurveyQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surveyId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "ClimateSurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "ClimateSurvey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClimateSurveyResponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surveyId" INTEGER NOT NULL,
    "hashId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSubmit" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME,
    CONSTRAINT "ClimateSurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "ClimateSurvey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClimateSurveyAnswer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "responseId" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    CONSTRAINT "ClimateSurveyAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ClimateSurveyQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClimateSurveyAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ClimateSurveyResponse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClimateSurveyAISummary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surveyId" INTEGER NOT NULL,
    "responseId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClimateSurveyAISummary_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "ClimateSurvey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClimateSurveyAISummary_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ClimateSurveyResponse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClimateSurveyAISummary_responseId_key" ON "ClimateSurveyAISummary"("responseId");
