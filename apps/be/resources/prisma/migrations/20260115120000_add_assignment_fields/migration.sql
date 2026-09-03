-- AlterTable: Add assignment fields to Rocket
ALTER TABLE "Rocket" ADD COLUMN "height" DECIMAL(10,2);
ALTER TABLE "Rocket" ADD COLUMN "weight" DECIMAL(10,2);
ALTER TABLE "Rocket" ADD COLUMN "launch_datetime" TIMESTAMP(3);
ALTER TABLE "Rocket" ADD COLUMN "rocket_type" TEXT;
ALTER TABLE "Rocket" ADD COLUMN "passengers" JSONB;
ALTER TABLE "Rocket" ADD COLUMN "crew" JSONB;

-- AlterTable: Make modelId optional (previously required)
ALTER TABLE "Rocket" ALTER COLUMN "model_id" DROP NOT NULL;

-- DropForeignKey (to allow null)
ALTER TABLE "Rocket" DROP CONSTRAINT IF EXISTS "Rocket_model_id_fkey";

-- AddForeignKey (with optional relation)
ALTER TABLE "Rocket" ADD CONSTRAINT "Rocket_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "RocketModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
