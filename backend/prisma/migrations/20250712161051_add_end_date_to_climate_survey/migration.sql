/*
  Warnings:

  - Added the required column `endDate` to the `ClimateSurvey` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClimateSurvey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "createdById" INTEGER NOT NULL,
    CONSTRAINT "ClimateSurvey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClimateSurvey" ("createdAt", "createdById", "description", "id", "isActive", "title") SELECT "createdAt", "createdById", "description", "id", "isActive", "title" FROM "ClimateSurvey";
DROP TABLE "ClimateSurvey";
ALTER TABLE "new_ClimateSurvey" RENAME TO "ClimateSurvey";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
