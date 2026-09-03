import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeAll, describe, it } from 'vitest';

import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { EmailModule } from '~common/email';
import { EmailConfig } from '~common/email/email.config';
import { EmailLoader } from '~common/email/email.loader';
import { EmailProvider } from '~common/email/email-provider.abstract';
import { EmailCompilerType, EmailLogDetail, EmailLogLevel, EmailMode, EmailTemplateType } from '~common/email/models';
import { PrismaEmailTemplatePersistorPlugin } from '~common/email/persistors/prisma';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { EmailProviderMock } from '~common/email/tests/email.mock';
import { MyEmailTemplate, MyTemplateProvider } from '~common/email/tests/email-template.mock';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';
import { EmailTemplateSendAdminRequest } from '~modules/admin/email/send/models/email-template-send-admin.request';
import { EmailSystemTemplateAdminModule } from '~modules/admin/email/system-template/email-system-template-admin.module';

import { EmailTemplateFixture } from '../../../../../common/email/persistors/prisma/tests/email-template.fixture';
import { EmailAdminSendModule } from '../../send/email-send-admin.module';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

describe('EmailSystemAdminTemplate', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;
  let emailLoader: EmailLoader;
  let emailProviderSend: typeof EmailProviderMock.useValue.send;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forRoot([AdminUserPrismaRepositoryPlugin]),
          AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
          AuthzModule.forRoot([]),
          AdminUserModule,
          AdminUserAuthJwtModule,

          EmailModule.forRoot([PrismaEmailTemplatePersistorPlugin, NoOpEmailProviderPlugin]),

          EmailSystemTemplateAdminModule,
          EmailAdminSendModule,
        ],
        providers: [MyTemplateProvider],
      },
      {
        overrideProviders: [
          [
            EmailConfig,
            {
              defaultProvider: EmailProviderMock.useValue.name,
              defaultFrom: 'test@example.com',
              mode: EmailMode.ENABLED,
              logDetail: EmailLogDetail.CONTENT,
              logLevel: EmailLogLevel.DEBUG,
            },
          ],
        ],
      },
    );
    prismaService = app.get(PrismaService);
    emailLoader = app.get(EmailLoader);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['email-manager'] });

    // Register mock provider
    emailLoader.providers = {
      [EmailProviderMock.useValue.name]: EmailProviderMock.useValue as EmailProvider,
    };

    emailProviderSend = EmailProviderMock.useValue.send;
  });

  afterEach(async () => {
    await prismaService.client.emailTemplate.deleteMany();
    emailProviderSend.mock.resetCalls();
  });

  it('should fetch system templates', async ({ expect }) => {
    const name = `test-static-template-${makeId()}`;
    const template = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name,
      type: EmailTemplateType.SYSTEM,
    });

    const { body } = await request(app.getHttpServer())
      .get('/admin/emails/templates/system')
      .query({ 'filter[type]': EmailTemplateType.SYSTEM, limit: 20, 'filter[names]': name })
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        items: expect.arrayContaining([expect.objectContaining({ name })]),
        totalItems: 1,
        page: 1,
        limit: expect.any(Number),
      }),
    );

    const staticTemplate = body.items.find((item: { name: string }) => item.name === template.entity.name);
    expect(staticTemplate).toBeDefined();
    expect(staticTemplate).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: template.entity.name,
        engine: EmailCompilerType.HTML,
        type: EmailTemplateType.SYSTEM,
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      }),
    );
  });

  it('should update a system template', async ({ expect }) => {
    const template = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `test-update-template-${makeId()}`,
      subject: 'Original Subject',
      html: '<p>Original HTML</p>',
      text: 'Original Text',
      type: EmailTemplateType.SYSTEM,
    });

    const updateData = {
      name: template.entity.name,
      engine: EmailCompilerType.HTML,
      subject: 'Updated Subject',
      html: '<p>Updated HTML</p>',
      text: 'Updated Text',
      description: 'Updated description',
    };

    const { body: body1 } = await request(app.getHttpServer())
      .get(`/admin/emails/templates/system/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .send(updateData)
      .expect(200);

    expect(body1).toEqual(
      expect.objectContaining({
        name: template.entity.name,
        subject: 'Original Subject',
        html: '<p>Original HTML</p>',
        text: 'Original Text',
        type: EmailTemplateType.SYSTEM,
      }),
    );

    const { body } = await request(app.getHttpServer())
      .put(`/admin/emails/templates/system/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .send(updateData)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        id: template.entity.name,
        name: template.entity.name,
        engine: EmailCompilerType.HTML,
        subject: 'Updated Subject',
        html: '<p>Updated HTML</p>',
        text: 'Updated Text',
        description: 'Updated description',
        type: EmailTemplateType.SYSTEM,
      }),
    );
  });

  it('should override system template', async ({ expect }) => {
    const createData = {
      name: MyEmailTemplate.name,
      engine: EmailCompilerType.HTML,
      subject: 'Overridden Subject',
      html: '<p>Overridden HTML Content</p>',
      text: 'Overridden Text Content',
    };

    const createResponse = await request(app.getHttpServer())
      .put(`/admin/emails/templates/system/${MyEmailTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .send(createData)
      .expect(200);

    expect(createResponse.body).toEqual(expect.objectContaining(createData));

    const getResponse = await request(app.getHttpServer())
      .get(`/admin/emails/templates/system/${MyEmailTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(getResponse.body).toEqual(
      expect.objectContaining({
        ...createData,
        type: EmailTemplateType.SYSTEM,
      }),
    );

    // after deletion, the tempalte should be system template again
    await request(app.getHttpServer())
      .delete(`/admin/emails/templates/system/${MyEmailTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(204);

    const getResponseAfterDeletion = await request(app.getHttpServer())
      .get(`/admin/emails/templates/system/${MyEmailTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(getResponseAfterDeletion.body).toEqual(
      expect.objectContaining({
        ...MyEmailTemplate,
        type: EmailTemplateType.SYSTEM,
      }),
    );
  });

  it('should send email using template', async ({ expect }) => {
    const sendData: EmailTemplateSendAdminRequest = {
      to: ['test@example.com'],
      templateName: MyEmailTemplate.name,
      templateVariables: [
        {
          param: 'code',
          value: '123456',
        },
      ],
    };

    await request(app.getHttpServer())
      .post('/admin/emails/templates/send')
      .set('Authorization', admin.authorizationHeader)
      .send(sendData)
      .expect(201);

    expect(emailProviderSend.mock.calls).toHaveLength(1);
    const callArgs = emailProviderSend.mock.calls[0]?.arguments;
    expect(callArgs?.[0]).toEqual(
      expect.objectContaining({
        to: ['test@example.com'],
        subject: expect.stringContaining('123456'),
        htmlContent: expect.stringContaining('This is your code: 123456.'),
      }),
    );
  });

  it('should fetch template labels', async ({ expect }) => {
    const template1 = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `test-label-1-${makeId()}`,
      subject: 'Label Template 1',
      html: '<p>Label 1</p>',
    });

    const template2 = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `test-label-2-${makeId()}`,
      subject: 'Label Template 2',
      html: '<p>Label 2</p>',
    });

    const { body } = await request(app.getHttpServer())
      .get('/admin/emails/templates/labels')
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toBeInstanceOf(Array);

    const label1 = body.find((label: { label: string }) => label.label === template1.entity.name);
    const label2 = body.find((label: { label: string }) => label.label === template2.entity.name);

    expect(label1).toBeDefined();
    expect(label1).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        label: template1.entity.name,
      }),
    );

    expect(label2).toBeDefined();
    expect(label2).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        label: template2.entity.name,
      }),
    );
  });

  it('should fetch template labels with search query', async ({ expect }) => {
    const template1 = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `search-label-1-${makeId()}`,
      subject: 'Search Label Template',
      html: '<p>Search Label</p>',
    });

    const template2 = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `other-label-${makeId()}`,
      subject: 'Other Label Template',
      html: '<p>Other Label</p>',
    });

    const { body } = await request(app.getHttpServer())
      .get('/admin/emails/templates/labels')
      .query({ search: 'search-label' })
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toBeInstanceOf(Array);

    const searchLabel = body.find((label: { label: string }) => label.label === template1.entity.name);
    const otherLabel = body.find((label: { label: string }) => label.label === template2.entity.name);

    expect(searchLabel).toBeDefined();
    expect(otherLabel).toBeUndefined();
  });

  it('should send regular email', async () => {
    const sendData = {
      to: ['test@example.com'],
      subject: 'Test Email Subject',
      htmlContent: '<p>Test HTML Content</p>',
      textContent: 'Test Text Content',
    };

    await request(app.getHttpServer())
      .post('/admin/emails/send')
      .set('Authorization', admin.authorizationHeader)
      .send(sendData)
      .expect(201);
  });

  it('should send regular email with cc and bcc', async () => {
    const sendData = {
      to: ['test@example.com'],
      subject: 'Test Email with CC and BCC',
      htmlContent: '<p>Test HTML Content</p>',
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
    };

    await request(app.getHttpServer())
      .post('/admin/emails/send')
      .set('Authorization', admin.authorizationHeader)
      .send(sendData)
      .expect(201);
  });
});
