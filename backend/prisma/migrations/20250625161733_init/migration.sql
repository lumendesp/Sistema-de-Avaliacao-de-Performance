/*
  Warnings:

  - You are about to drop the `CriterionEvaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackCriteria` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CriterionEvaluation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TrackCriteria";
PRAGMA foreign_keys=on;
