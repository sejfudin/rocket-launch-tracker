import { Module } from '@nestjs/common';

import { ActivityModule } from '~common/activities';
import { PrismaActivityPersistorPlugin } from '~common/activities/persistors/prisma';
import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { EmailModule } from '~common/email';
import { MjmlEmailCompilerPlugin } from '~common/email/compilers/mjml/mjml.email-compiler';
import { PrismaEmailTemplatePersistorPlugin } from '~common/email/persistors/prisma';
import { AwsSesEmailPlugin } from '~common/email/providers/aws-ses';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { HttpHealthModule } from '~common/http/health';
import { HttpServeStaticModule } from '~common/http/serve';
import { LoggerModule } from '~common/logger';
import { MediaModule } from '~common/media';
import { PrismaMediaPersistorPlugin } from '~common/media/persistors/prisma';
import { AwsS3MediaPlugin } from '~common/media/providers/aws-s3';
import { PrismaMediaProviderPlugin } from '~common/media/providers/prisma';
import { PushNotificationModule } from '~common/push-notifications';
import {
  PrismaPushNotificationTemplatePersistorPlugin,
  PrismaPushNotificationTokenPersistorPlugin,
} from '~common/push-notifications/persistors/prisma';
import { FcmPushNotificationPlugin } from '~common/push-notifications/providers/fcm';
import { QueueModule } from '~common/queues';
import { PrismaQueuePersistorPlugin } from '~common/queues/persistors/prisma';
import { PrismaQueuePlugin } from '~common/queues/providers/prisma';

@Module({
  imports: [
    HttpHealthModule,
    LoggerModule,

    HttpServeStaticModule,

    AuthzModule.forRoot([]),

    AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),

    QueueModule.forRoot([PrismaQueuePlugin, PrismaQueuePersistorPlugin]),

    ActivityModule.forRoot([PrismaActivityPersistorPlugin]),

    MediaModule.forRoot([PrismaMediaPersistorPlugin, PrismaMediaProviderPlugin, AwsS3MediaPlugin]),

    EmailModule.forRoot([
      PrismaEmailTemplatePersistorPlugin,

      NoOpEmailProviderPlugin,
      MjmlEmailCompilerPlugin,
      AwsSesEmailPlugin,
    ]),

    PushNotificationModule.forRoot([
      PrismaPushNotificationTokenPersistorPlugin,
      PrismaPushNotificationTemplatePersistorPlugin,

      FcmPushNotificationPlugin,
    ]),
  ],
})
export class CommonModule {}
