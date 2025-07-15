-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KeyResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "okrId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "KeyResult_okrId_fkey" FOREIGN KEY ("okrId") REFERENCES "Okr" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KeyResult" ("description", "id", "okrId") SELECT "description", "id", "okrId" FROM "KeyResult";
DROP TABLE "KeyResult";
ALTER TABLE "new_KeyResult" RENAME TO "KeyResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
