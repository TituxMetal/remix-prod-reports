/*
  Warnings:

  - You are about to drop the column `status` on the `Report` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ReportStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    CONSTRAINT "Report_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("createdAt", "details", "duration", "endDate", "id", "ownerId", "reasonForDowntime", "startDate", "storageLocation", "updatedAt", "workstationId") SELECT "createdAt", "details", "duration", "endDate", "id", "ownerId", "reasonForDowntime", "startDate", "storageLocation", "updatedAt", "workstationId" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "ReportStatus_name_key" ON "ReportStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReportStatus_displayName_key" ON "ReportStatus"("displayName");
