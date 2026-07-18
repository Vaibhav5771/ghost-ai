-- Rename canvasJsonPath to canvasBlobUrl and make it nullable.
-- New projects have no saved canvas until the first autosave writes to Vercel Blob.
ALTER TABLE "Project" RENAME COLUMN "canvasJsonPath" TO "canvasBlobUrl";
ALTER TABLE "Project" ALTER COLUMN "canvasBlobUrl" DROP NOT NULL;
UPDATE "Project" SET "canvasBlobUrl" = NULL WHERE "canvasBlobUrl" = '';
