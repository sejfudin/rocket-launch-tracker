import { type INestApplication } from '@nestjs/common';
import { beforeAll, describe, it } from 'vitest';

import { EmailModule } from '~common/email';
import { PrismaEmailTemplatePersistorPlugin } from '~common/email/persistors/prisma';
import { EmailTemplateFixture } from '~common/email/persistors/prisma/tests/email-template.fixture';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { MyEmailTemplate, MyTemplateProvider } from '~common/email/tests/email-template.mock';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { EmailSendAdminService } from '~modules/admin/email/send/email-send-admin.service';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

describe('EmailSendAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let emailSendAdminService: EmailSendAdminService;

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [
        PrismaEphemeralModule.forRoot([]),
        EmailModule.forRoot([PrismaEmailTemplatePersistorPlugin, NoOpEmailProviderPlugin]),
      ],
      providers: [MyTemplateProvider, EmailSendAdminService],
    });
    prismaService = app.get(PrismaService);
    emailSendAdminService = app.get(EmailSendAdminService);
  });

  it('should fetch labels with static and custom templates', async ({ expect }) => {
    const customTemplate = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `custom-label-1-${makeId()}`,
    });

    expect(await emailSendAdminService.listLabels({})).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: MyEmailTemplate.name,
        }),
        expect.objectContaining({
          label: customTemplate.entity.name,
        }),
      ]),
    );

    expect(await emailSendAdminService.listLabels({ search: MyEmailTemplate.name })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: MyEmailTemplate.name,
        }),
      ]),
    );

    expect(await emailSendAdminService.listLabels({ search: 'custom-label-1' })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: customTemplate.entity.name,
        }),
      ]),
    );
  });
});
