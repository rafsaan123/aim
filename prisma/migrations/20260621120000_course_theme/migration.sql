-- AlterTable
ALTER TABLE "Course" ADD COLUMN "themeColor" TEXT NOT NULL DEFAULT '#1d4ed8';
ALTER TABLE "Course" ADD COLUMN "imageData" BLOB;
ALTER TABLE "Course" ADD COLUMN "imageMimeType" TEXT;
ALTER TABLE "Course" ADD COLUMN "imageFileName" TEXT;
