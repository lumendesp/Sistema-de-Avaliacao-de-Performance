/*
  Warnings:

  - Added the required column `groupId` to the `ConfiguredCriterion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Criterion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CriterionGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    CONSTRAINT "CriterionGroup_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CriterionGroup_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CriterionGroup_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConfiguredCriterion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "criterionId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "mandatory" BOOLEAN NOT NULL,
    CONSTRAINT "ConfiguredCriterion_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfiguredCriterion_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CriterionGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfiguredCriterion_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfiguredCriterion_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfiguredCriterion_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConfiguredCriterion" ("criterionId", "id", "mandatory", "positionId", "trackId", "unitId") SELECT "criterionId", "id", "mandatory", "positionId", "trackId", "unitId" FROM "ConfiguredCriterion";
DROP TABLE "ConfiguredCriterion";
ALTER TABLE "new_ConfiguredCriterion" RENAME TO "ConfiguredCriterion";
CREATE TABLE "new_Criterion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "generalDescription" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "weight" INTEGER NOT NULL
);
INSERT INTO "new_Criterion" ("active", "generalDescription", "id", "name") SELECT "active", "generalDescription", "id", "name" FROM "Criterion";
DROP TABLE "Criterion";
ALTER TABLE "new_Criterion" RENAME TO "Criterion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
