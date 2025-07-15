/*
  Warnings:

  - Added the required column `updatedAt` to the `ClimateSurveyAISummary` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClimateSurveyAISummary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surveyId" INTEGER NOT NULL,
    "text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClimateSurveyAISummary_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "ClimateSurvey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClimateSurveyAISummary" ("createdAt", "id", "surveyId", "text") SELECT "createdAt", "id", "surveyId", "text" FROM "ClimateSurveyAISummary";
DROP TABLE "ClimateSurveyAISummary";
ALTER TABLE "new_ClimateSurveyAISummary" RENAME TO "ClimateSurveyAISummary";
CREATE UNIQUE INDEX "ClimateSurveyAISummary_surveyId_key" ON "ClimateSurveyAISummary"("surveyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
