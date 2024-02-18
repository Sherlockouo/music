/*
  Warnings:

  - You are about to drop the column `artwork` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `editorialVideo` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `neteaseId` on the `Artist` table. All the data in the column will be lost.
  - Added the required column `json` to the `Artist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Artist` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Artist" ("id") SELECT "id" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_id_key" ON "Artist"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
