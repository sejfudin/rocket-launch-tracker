import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeAll, describe, it } from 'vitest';

import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { EmailModule } from '~common/email';
import { EmailCompilerType, EmailTemplateType } from '~common/email/models';
import { PrismaEmailTemplatePersistorPlugin } from '~common/email/persistors/prisma';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { MyEmailTemplate, MyTemplateProvider } from '~common/email/tests/email-template.mock';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';
import { EmailCustomTemplateAdminModule } from '~modules/admin/email/custom-template/email-custom-template-admin.module';
import { EmailTemplateSendAdminRequest } from '~modules/admin/email/send/models/email-template-send-admin.request';

import { EmailTemplateFixture } from '../../../../../common/email/persistors/prisma/tests/email-template.fixture';
import { EmailAdminSendModule } from '../../send/email-send-admin.module';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

describe('EmailCustomTemplateAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [
        PrismaEphemeralModule.forRoot([AdminUserPrismaRepositoryPlugin]),
        AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
        AuthzModule.forRoot([]),
        AdminUserModule,
        AdminUserAuthJwtModule,

        EmailModule.forRoot([PrismaEmailTemplatePersistorPlugin, NoOpEmailProviderPlugin]),

        EmailCustomTemplateAdminModule,
        EmailAdminSendModule,
      ],
      providers: [MyTemplateProvider],
    });
    prismaService = app.get(PrismaService);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['email-manager'] });
  });

  afterEach(async () => {
    await prismaService.client.emailTemplate.deleteMany();
  });

  it('should fetch custom templates', async ({ expect }) => {
    const name = `test-custom-template-${makeId()}`;
    const template = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name,
      type: EmailTemplateType.CUSTOM,
    });

    const { body } = await request(app.getHttpServer())
      .get('/admin/emails/templates/custom')
      .query({ 'filter[type]': EmailTemplateType.CUSTOM, limit: 20, 'filter[names]': name })
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

    const customTemplate = body.items.find((item: { name: string }) => item.name === template.entity.name);
    expect(customTemplate).toBeDefined();
    expect(customTemplate).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: template.entity.name,
        engine: EmailCompilerType.HTML,
        type: EmailTemplateType.CUSTOM,
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      }),
    );
  });

  it('should create a custom template', async ({ expect }) => {
    const createData = {
      name: `test-create-template-${makeId()}`,
      engine: EmailCompilerType.HTML,
      subject: 'New Custom Template Subject',
      html: '<p>New Custom HTML</p>',
      text: 'New Custom Text',
      description: 'A new custom template',
    };

    const { body } = await request(app.getHttpServer())
      .post('/admin/emails/templates/custom')
      .set('Authorization', admin.authorizationHeader)
      .send(createData)
      .expect(201);

    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: createData.name,
        engine: EmailCompilerType.HTML,
        subject: createData.subject,
        html: createData.html,
        text: createData.text,
        description: createData.description,
        type: EmailTemplateType.CUSTOM,
      }),
    );
  });

  it('should not create a custom template with system template name', async ({ expect }) => {
    const createData = {
      name: MyEmailTemplate.name,
      engine: EmailCompilerType.HTML,
      subject: 'Custom Template Subject',
      html: '<p>Custom HTML</p>',
      text: 'Custom Text',
    };

    const { body } = await request(app.getHttpServer())
      .post('/admin/emails/templates/custom')
      .set('Authorization', admin.authorizationHeader)
      .send(createData)
      .expect(400);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'custom-template-name-conflict',
      }),
    );
  });

  it('should get a custom template by name', async ({ expect }) => {
    const template = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `test-get-template-${makeId()}`,
      subject: 'Get Template Subject',
      html: '<p>Get HTML</p>',
      text: 'Get Text',
      type: EmailTemplateType.CUSTOM,
    });

    const { body } = await request(app.getHttpServer())
      .get(`/admin/emails/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        id: template.entity.name, // id is the name
        name: template.entity.name,
        engine: EmailCompilerType.HTML,
        subject: 'Get Template Subject',
        html: '<p>Get HTML</p>',
        text: 'Get Text',
        type: EmailTemplateType.CUSTOM,
      }),
    );
  });

  it('should update a custom template', async ({ expect }) => {
    const template = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `test-update-template-${makeId()}`,
      subject: 'Original Subject',
      html: '<p>Original HTML</p>',
      text: 'Original Text',
      type: EmailTemplateType.CUSTOM,
    });

    const updateData = {
      engine: EmailCompilerType.HTML,
      subject: 'Updated Subject',
      html: '<p>Updated HTML</p>',
      text: 'Updated Text',
      description: 'Updated description',
    };

    const { body } = await request(app.getHttpServer())
      .put(`/admin/emails/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .send(updateData)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        id: template.entity.name, // id is the name
        name: template.entity.name,
        engine: EmailCompilerType.HTML,
        subject: 'Updated Subject',
        html: '<p>Updated HTML</p>',
        text: 'Updated Text',
        description: 'Updated description',
        type: EmailTemplateType.CUSTOM,
      }),
    );
  });

  it('should delete a custom template', async ({ expect }) => {
    const template = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `test-delete-template-${makeId()}`,
      type: EmailTemplateType.CUSTOM,
    });

    await request(app.getHttpServer())
      .delete(`/admin/emails/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(204);

    const { body } = await request(app.getHttpServer())
      .get(`/admin/emails/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(404);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'not-found',
      }),
    );
  });

  it('should send email using custom template', async () => {
    const template = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `test-send-custom-template-${makeId()}`,
      subject: 'Hello {{name}}',
      html: '<p>Hello {{name}}, welcome!</p>',
      text: 'Hello {{name}}, welcome!',
      type: EmailTemplateType.CUSTOM,
    });

    const sendData: EmailTemplateSendAdminRequest = {
      to: ['test@example.com'],
      templateName: template.entity.name,
      templateVariables: [
        {
          param: 'name',
          value: 'John Doe',
        },
      ],
    };

    await request(app.getHttpServer())
      .post('/admin/emails/templates/send')
      .set('Authorization', admin.authorizationHeader)
      .send(sendData)
      .expect(201);
  });

  it('should return 404 when getting non-existent custom template', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .get(`/admin/emails/templates/custom/non-existent-template-${makeId()}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(404);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'not-found',
      }),
    );
  });

  it('should return 404 when updating non-existent custom template', async ({ expect }) => {
    const updateData = {
      engine: EmailCompilerType.HTML,
      subject: 'Updated Subject',
      html: '<p>Updated HTML</p>',
      text: 'Updated Text',
    };

    const { body } = await request(app.getHttpServer())
      .put(`/admin/emails/templates/custom/non-existent-template-${makeId()}`)
      .set('Authorization', admin.authorizationHeader)
      .send(updateData)
      .expect(404);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'not-found',
      }),
    );
  });

  it('should filter custom templates by search query', async ({ expect }) => {
    const template1 = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `search-custom-1-${makeId()}`,
      subject: 'Search Custom Template',
      html: '<p>Search Custom</p>',
      type: EmailTemplateType.CUSTOM,
    });

    const template2 = await EmailTemplateFixture.fromPartial(prismaService.client, {
      name: `other-custom-${makeId()}`,
      subject: 'Other Custom Template',
      html: '<p>Other Custom</p>',
      type: EmailTemplateType.CUSTOM,
    });

    const { body } = await request(app.getHttpServer())
      .get('/admin/emails/templates/custom')
      .query({ 'filter[search]': 'search-custom' })
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toBeDefined();
    expect(body.items).toBeInstanceOf(Array);

    const searchTemplate = body.items.find((item: { name: string }) => item.name === template1.entity.name);
    const otherTemplate = body.items.find((item: { name: string }) => item.name === template2.entity.name);

    expect(searchTemplate).toBeDefined();
    expect(otherTemplate).toBeUndefined();
  });
});
