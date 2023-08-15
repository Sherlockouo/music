CREATE TABLE "Album" (
  "id" INTEGER PRIMARY KEY,
  "neteaseId" INTEGER UNIQUE,
  "name" TEXT,
  "neteaseName" TEXT,
  "artistName" TEXT,
  "neteaseArtistName" TEXT,
  "copyright" TEXT,
  "editorialVideo" TEXT,
  "artwork" TEXT
);

CREATE TABLE "AlbumEditorialNote" (
  "id" INTEGER PRIMARY KEY,
  "album" INTEGER UNIQUE REFERENCES "Album"("id"),
  "en_US" TEXT,
  "zh_CN" TEXT
);

CREATE TABLE "Artist" (
  "id" INTEGER PRIMARY KEY,
  "neteaseId" INTEGER UNIQUE,
  "name" TEXT,
  "artwork" TEXT,
  "editorialVideo" TEXT
);

CREATE TABLE "ArtistBio" (
  "id" INTEGER PRIMARY KEY,
  "artist" INTEGER UNIQUE REFERENCES "Artist"("id"),
  "en_US" TEXT,
  "zh_CN" TEXT
);