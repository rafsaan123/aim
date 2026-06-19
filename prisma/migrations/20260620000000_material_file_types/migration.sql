-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudyMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileData" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudyMaterial" ("id", "courseId", "title", "fileName", "fileType", "mimeType", "fileData", "createdAt")
SELECT "id", "courseId", "title", "pdfFileName", 'PDF', 'application/pdf', "pdfData", "createdAt" FROM "StudyMaterial";
DROP TABLE "StudyMaterial";
ALTER TABLE "new_StudyMaterial" RENAME TO "StudyMaterial";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
