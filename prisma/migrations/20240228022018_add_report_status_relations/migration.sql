-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reasonForDowntime" TEXT NOT NULL,
    "storageLocation" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 3,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "workstationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "statusName" TEXT NOT NULL DEFAULT 'Pending',
    CONSTRAINT "Report_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_statusName_fkey" FOREIGN KEY ("statusName") REFERENCES "ReportStatus" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("createdAt", "details", "duration", "endDate", "id", "ownerId", "reasonForDowntime", "startDate", "storageLocation", "updatedAt", "workstationId") SELECT "createdAt", "details", "duration", "endDate", "id", "ownerId", "reasonForDowntime", "startDate", "storageLocation", "updatedAt", "workstationId" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
