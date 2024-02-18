/*
  Warnings:

  - You are about to drop the column `artistName` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `artwork` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `copyright` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `editorialVideo` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `neteaseArtistName` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `neteaseId` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `neteaseName` on the `Album` table. All the data in the column will be lost.
  - Added the required column `json` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Album` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Album" ("id") SELECT "id" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
