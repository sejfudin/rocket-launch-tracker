/*
  Warnings:

  - You are about to drop the column `blob` on the `Media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "blob",
ADD COLUMN     "deleted" TIMESTAMP(3),
ADD COLUMN     "loOid" OID,
ADD COLUMN     "uploaded_new" TIMESTAMP(3),
ADD COLUMN     "validated_new" TIMESTAMP(3);

-- Migrate data: set to NOW() if old boolean was true
UPDATE "Media" SET "uploaded_new" = NOW() WHERE "uploaded" = true;
UPDATE "Media" SET "validated_new" = NOW() WHERE "validated" = true;

-- Drop old columns
ALTER TABLE "Media" 
DROP COLUMN "uploaded",
DROP COLUMN "validated";

-- Rename new columns
ALTER TABLE "Media" RENAME COLUMN "uploaded_new" TO "uploaded";
ALTER TABLE "Media" RENAME COLUMN "validated_new" TO "validated";
