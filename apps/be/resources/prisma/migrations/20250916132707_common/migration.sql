
-- CreateTable
CREATE TABLE "public"."AuthnIdentity" (
    "id" UUID NOT NULL,
    "namespace" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "providerData" JSONB NOT NULL,
    "disabledAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthnIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthnNonce" (
    "id" UUID NOT NULL,
    "authId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "hashedNonce" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedData" JSONB,

    CONSTRAINT "AuthnNonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerResponse" TEXT DEFAULT '{}',
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "subject" TEXT,
    "html" TEXT,
    "text" TEXT,
    "status" TEXT NOT NULL,
    "failedMessage" TEXT,
    "templateName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT,
    "description" TEXT,
    "from" TEXT,
    "cc" TEXT,
    "bcc" TEXT,
    "engine" TEXT NOT NULL,
    "engineOptions" JSONB,
    "subject" TEXT,
    "html" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "meta" JSONB,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "blob" BYTEA,
    "module" TEXT,
    "type" TEXT,
    "resourceId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushNotificationLog" (
    "id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "templateName" TEXT,
    "provider" TEXT NOT NULL,
    "providerResponse" TEXT,
    "title" TEXT NOT NULL,
    "deviceTokens" TEXT[],
    "additionalData" TEXT,
    "failedMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushNotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushNotificationTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "additionalData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushNotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushNotificationToken" (
    "id" UUID NOT NULL,
    "resourceName" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushNotificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthnIdentity_namespace_provider_providerId_key" ON "public"."AuthnIdentity"("namespace", "provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "public"."EmailTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Media_key_key" ON "public"."Media"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PushNotificationTemplate_name_key" ON "public"."PushNotificationTemplate"("name");

-- AddForeignKey
ALTER TABLE "public"."AuthnNonce" ADD CONSTRAINT "AuthnNonce_authId_fkey" FOREIGN KEY ("authId") REFERENCES "public"."AuthnIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
