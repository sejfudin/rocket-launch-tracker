-- CreateTable
CREATE TABLE "public"."AdminUser" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "roles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rocket" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "pictureId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rocket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RocketTimelapse" (
    "id" UUID NOT NULL,
    "pictureId" UUID NOT NULL,
    "rocketId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RocketTimelapse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "roles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rocket_name_key" ON "public"."Rocket"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rocket_pictureId_key" ON "public"."Rocket"("pictureId");

-- CreateIndex
CREATE UNIQUE INDEX "RocketTimelapse_pictureId_key" ON "public"."RocketTimelapse"("pictureId");

-- AddForeignKey
ALTER TABLE "public"."RocketTimelapse" ADD CONSTRAINT "RocketTimelapse_rocketId_fkey" FOREIGN KEY ("rocketId") REFERENCES "public"."Rocket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
