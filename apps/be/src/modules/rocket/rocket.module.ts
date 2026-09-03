import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { EmailModule } from '~common/email';
import { MediaModule } from '~common/media';
import { PushNotificationModule } from '~common/push-notifications';
import { QueueModule } from '~common/queues';

import { RocketEmailTemplates } from '~modules/rocket/rocket.email-templates';
import { UserModule } from '~modules/users/user/user.module';

import { RocketPrismaRepository } from './persistors/prisma';
import { RocketModelPrismaRepository } from './persistors/prisma/rocket-model.prisma-repository';
import { RocketDefaultProvider } from './providers/default/rocket-default.provider';
import { RocketConfig } from './rocket.config';
import { RocketController } from './rocket.controller';
import { RocketMediaService } from './rocket.media.service';
import { RocketPushNotificationService } from './rocket.push-notification.service';
import { RocketQueues } from './rocket.queues';
import { RocketRepository } from './rocket.repository';
import { RocketService } from './rocket.service';
import { RocketModelRepository } from './rocket-model.repository';
import { RocketProvider } from './rocket-provider.abstract';

/**
 * Example Module
 */
@Module({
  imports: [
    //
    EmailModule.forFeature(),
    MediaModule.forFeature(),
    PushNotificationModule.forFeature(),
    QueueModule.forFeature(),
    UserModule,
  ],
  controllers: [RocketController],
  providers: [
    getConfigFactory(RocketConfig),
    RocketService,
    RocketMediaService,
    RocketPushNotificationService,
    RocketQueues,
    { provide: RocketRepository, useClass: RocketPrismaRepository },
    { provide: RocketModelRepository, useClass: RocketModelPrismaRepository },
    { provide: RocketProvider, useClass: RocketDefaultProvider },
    RocketEmailTemplates,
  ],
  exports: [RocketService, RocketModelRepository],
})
export class RocketModule {}
