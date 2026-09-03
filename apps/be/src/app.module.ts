import { Module } from '@nestjs/common';

import { PrismaModule } from '~database/prisma';

import { AdminModule } from '~admin.module';
import { CommonModule } from '~common.module';

import { MediaLibraryModule } from '~modules/media';
import { RocketModule } from '~modules/rocket';
import { UserAuthAppleModule } from '~modules/users/auth/providers/apple/user-auth-apple.module';
import { UserAuthGoogleModule } from '~modules/users/auth/providers/google/user-auth-google.module';
import { UserAuthForgotPasswordModule } from '~modules/users/auth/providers/local/forgot-password';
import { UserAuthMagicLinkModule } from '~modules/users/auth/providers/local/magic-link';
import { UserAuthPasswordModule } from '~modules/users/auth/providers/local/password';
import { UserMeModule } from '~modules/users/me';
import { UserPushNotificationModule } from '~modules/users/push-notifications';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';

@Module({
  imports: [
    CommonModule,

    PrismaModule.forRoot([
      //
      UserPrismaRepositoryPlugin,
    ]),

    // users
    UserAuthMagicLinkModule,
    UserAuthForgotPasswordModule,
    UserAuthPasswordModule,

    UserAuthGoogleModule,
    UserAuthAppleModule,

    UserMeModule,
    UserPushNotificationModule,

    MediaLibraryModule,

    RocketModule,

    AdminModule,
  ],
})
export class AppModule {}
