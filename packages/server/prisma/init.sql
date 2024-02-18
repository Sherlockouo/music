-- CREATE TABLE  IF NOT EXISTS "Album" (
--   "id" INTEGER PRIMARY KEY,
--   "neteaseId" INTEGER UNIQUE,
--   "name" TEXT,
--   "neteaseName" TEXT,
--   "artistName" TEXT,
--   "neteaseArtistName" TEXT,
--   "copyright" TEXT,
--   "editorialVideo" TEXT,
--   "artwork" TEXT
-- );

-- CREATE TABLE  IF NOT EXISTS "AlbumEditorialNote" (
--   "id" INTEGER PRIMARY KEY,
--   "album" INTEGER UNIQUE REFERENCES "Album"("id"),
--   "en_US" TEXT,
--   "zh_CN" TEXT
-- );

-- CREATE TABLE  IF NOT EXISTS "Artist" (
--   "id" INTEGER PRIMARY KEY,
--   "neteaseId" INTEGER UNIQUE,
--   "name" TEXT,
--   "artwork" TEXT,
--   "editorialVideo" TEXT
-- );

-- CREATE TABLE IF NOT EXISTS "ArtistBio" (
--   "id" INTEGER PRIMARY KEY,
--   "artist" INTEGER UNIQUE REFERENCES "Artist"("id"),
--   "en_US" TEXT,
--   "zh_CN" TEXT
-- );
CREATE TABLE IF NOT EXISTS "AccountData" (
    "id" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "AppData" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "Track" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "Album" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "Unblock" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "Artist" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "ArtistAlbum" (
    "id" INTEGER NOT NULL,
    "hotAlbums" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "Playlist" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "Audio" (
    "id" INTEGER NOT NULL,
    "bitRate" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "queriedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "Lyrics" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "AppleMusicAlbum" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "AppleMusicArtist" (
    "id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
