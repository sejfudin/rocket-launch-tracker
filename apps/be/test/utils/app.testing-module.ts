import { type INestApplication, type ModuleMetadata } from '@nestjs/common';

import { ActivityModule } from '~common/activities';
import { NoOpActivityPersistorPlugin } from '~common/activities/persistors/no-op';
import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { EmailModule } from '~common/email';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { MediaModule } from '~common/media';
import { PrismaMediaPersistorPlugin } from '~common/media/persistors/prisma';
import { PrismaMediaProviderPlugin } from '~common/media/providers/prisma';
import { QueueModule } from '~common/queues';
import { HotwireQueuePlugin } from '~common/queues/providers/hotwire';

import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserModule } from '~modules/users/user';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';

import { createRestTestingModule } from './rest.testing-module';

/**
 * Prepare a testing application for e2e tests
 *  - Should mirror AppModule `src/app.module.ts`
 */
export const AppTestingModule: () => ModuleMetadata = () => ({
  imports: [
    PrismaEphemeralModule.forRoot([UserPrismaRepositoryPlugin]),

    AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
    AuthzModule.forRoot([]),
    ActivityModule.forRoot([NoOpActivityPersistorPlugin]),
    MediaModule.forRoot([PrismaMediaPersistorPlugin, PrismaMediaProviderPlugin]),
    QueueModule.forRoot([HotwireQueuePlugin]),
    EmailModule.forRoot([NoOpEmailProviderPlugin]),

    UserModule,
    UserAuthJwtModule,
  ],
});

export async function createAppTestingModule(
  plugins?: ModuleMetadata[] | ModuleMetadata,
  options?: Parameters<typeof createRestTestingModule>[1],
): Promise<INestApplication> {
  return createRestTestingModule(
    [AppTestingModule(), ...(plugins ? (Array.isArray(plugins) ? plugins : [plugins]) : [])],
    options,
  );
}
