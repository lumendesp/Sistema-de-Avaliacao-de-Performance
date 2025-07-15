/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ClimateSurveyResponse` table. All the data in the column will be lost.
  - Added the required column `userId` to the `ClimateSurveyResponse` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClimateSurveyResponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hashId" TEXT NOT NULL,
    "isSubmit" BOOLEAN NOT NULL,
    "submittedAt" DATETIME,
    "surveyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ClimateSurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "ClimateSurvey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClimateSurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClimateSurveyResponse" ("hashId", "id", "isSubmit", "submittedAt", "surveyId") SELECT "hashId", "id", "isSubmit", "submittedAt", "surveyId" FROM "ClimateSurveyResponse";
DROP TABLE "ClimateSurveyResponse";
ALTER TABLE "new_ClimateSurveyResponse" RENAME TO "ClimateSurveyResponse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
