/*
  Warnings:

  - You are about to drop the column `additionalData` on the `PushNotificationTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Rocket` table. All the data in the column will be lost.
  - You are about to drop the `EmailLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PushNotificationLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `model_id` to the `Rocket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'custom';

-- AlterTable
ALTER TABLE "PushNotificationTemplate" DROP COLUMN "additionalData",
ADD COLUMN     "data" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'custom',
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "module" DROP NOT NULL,
ALTER COLUMN "body" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PushNotificationToken" ADD COLUMN     "module" TEXT,
ADD COLUMN     "resourceId" UUID,
ADD COLUMN     "resourceLabel" TEXT;

-- AlterTable
ALTER TABLE "Rocket" DROP COLUMN "model",
ADD COLUMN     "model_id" UUID NOT NULL,
ADD COLUMN     "ownerId" UUID,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'unknown';

-- DropTable
DROP TABLE "public"."EmailLog";

-- DropTable
DROP TABLE "public"."PushNotificationLog";

-- CreateTable
CREATE TABLE "Activity" (
    "id" UUID NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "payload" JSONB NOT NULL,
    "metadata" JSONB,
    "module" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" UUID,
    "resource_id" UUID,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueJob" (
    "id" TEXT NOT NULL,
    "processor" TEXT NOT NULL,
    "options" JSONB,
    "payload" JSONB,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startAfter" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "QueueJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RocketModel" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RocketModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_module_timestamp_idx" ON "Activity"("module", "timestamp");

-- CreateIndex
CREATE INDEX "Activity_timestamp_idx" ON "Activity"("timestamp");

-- CreateIndex
CREATE INDEX "QueueJob_processor_idx" ON "QueueJob"("processor");

-- CreateIndex
CREATE INDEX "QueueJob_status_idx" ON "QueueJob"("status");

-- CreateIndex
CREATE INDEX "QueueJob_createdAt_idx" ON "QueueJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RocketModel_name_key" ON "RocketModel"("name");

-- AddForeignKey
ALTER TABLE "Rocket" ADD CONSTRAINT "Rocket_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "RocketModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
