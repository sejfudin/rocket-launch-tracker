import { HttpStatus, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { ActivityModule } from '~common/activities';
import { PrismaActivityPersistorPlugin } from '~common/activities/persistors/prisma';
import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { EmailModule } from '~common/email';
import { EmailConfig } from '~common/email/email.config';
import { EmailLoader } from '~common/email/email.loader';
import { EmailService } from '~common/email/email.service';
import { EmailProvider } from '~common/email/email-provider.abstract';
import { EmailLogDetail, EmailLogLevel, EmailMode } from '~common/email/models';
import { PrismaEmailTemplatePersistorPlugin } from '~common/email/persistors/prisma';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { EmailProviderMock } from '~common/email/tests/email.mock';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';

import { EMAIL_ADMIN_REST_PREFIX } from '../../email-admin.constants';
import { EmailActivityAdminModule } from '../email-activity-admin.module';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

const waitForActivity = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

describe('EmailActivityAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;
  let emailService: EmailService;
  let emailLoader: EmailLoader;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forRoot([
            UserPrismaRepositoryPlugin,
            AdminUserPrismaRepositoryPlugin,
            PrismaActivityPersistorPlugin,
          ]),

          AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
          AuthzModule.forRoot([]),
          ActivityModule.forRoot([PrismaActivityPersistorPlugin]),

          AdminUserModule,
          AdminUserAuthJwtModule,
          EmailModule.forRoot([PrismaEmailTemplatePersistorPlugin, NoOpEmailProviderPlugin]),
          EmailActivityAdminModule,
        ],
      },
      {
        overrideProviders: [
          [
            EmailConfig,
            {
              defaultProvider: EmailProviderMock.useValue.name,
              mode: EmailMode.SUPPRESSED,
              logDetail: EmailLogDetail.CONTENT,
              logLevel: EmailLogLevel.DEBUG,
            },
          ],
        ],
      },
    );
    prismaService = app.get(PrismaService);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['activity-manager'] });
    emailService = app.get(EmailService);
    emailLoader = app.get(EmailLoader);

    // Register mock provider
    emailLoader.providers = {
      [EmailProviderMock.useValue.name]: EmailProviderMock.useValue as EmailProvider,
    };
  });

  it('should get an email activity by id', async ({ expect }) => {
    await emailService.send({
      to: 'test@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test HTML Content</p>',
      textContent: 'Test Text Content',
      from: 'sender@example.com',
    });

    // Wait for activity to be created (it's async via setImmediate)
    await waitForActivity(200);

    const {
      body: { items: activities },
    } = await request(app.getHttpServer())
      .get(`/admin/${EMAIL_ADMIN_REST_PREFIX}/activities?filter[event]=suppressed`)
      .set('Authorization', admin.authorizationHeader)
      .expect(HttpStatus.OK);

    const activity = activities.find((item: any) => {
      return item.to?.includes('test@example.com');
    });

    expect(activity).toBeDefined();

    const { body } = await request(app.getHttpServer())
      .get(`/admin/${EMAIL_ADMIN_REST_PREFIX}/activities/${activity!.id}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(HttpStatus.OK);

    expect(body).toEqual(
      expect.objectContaining({
        id: activity!.id,
        module: 'email',
        type: 'email',
        event: 'suppressed',
        level: 'warn',
        provider: 'mock-provider',
        to: ['test@example.com'],
        subject: 'Test Email',
        htmlContent: '<p>Test HTML Content</p>',
        textContent: 'Test Text Content',
        from: 'sender@example.com',
      }),
    );
  });
});
