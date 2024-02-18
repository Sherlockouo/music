-- CreateTable
CREATE TABLE "Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "neteaseId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "neteaseName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "neteaseArtistName" TEXT NOT NULL,
    "copyright" TEXT,
    "editorialVideo" TEXT,
    "artwork" TEXT
);

-- CreateTable
CREATE TABLE "AlbumEditorialNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "en_US" TEXT,
    "zh_CN" TEXT
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "neteaseId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "artwork" TEXT,
    "editorialVideo" TEXT
);

-- CreateTable
CREATE TABLE "ArtistBio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "en_US" TEXT,
    "zh_CN" TEXT
);

-- CreateTable
CREATE TABLE "AccountData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Unblock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ArtistAlbum" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotAlbums" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Audio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bitRate" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "queriedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lyrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppleMusicAlbum" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppleMusicArtist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Album_id_key" ON "Album"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Album_neteaseId_key" ON "Album"("neteaseId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumEditorialNote_id_key" ON "AlbumEditorialNote"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_id_key" ON "Artist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_neteaseId_key" ON "Artist"("neteaseId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistBio_id_key" ON "ArtistBio"("id");
