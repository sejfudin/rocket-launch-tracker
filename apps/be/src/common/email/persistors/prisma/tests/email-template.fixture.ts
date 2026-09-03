import { EmailCompilerType, EmailTemplateType } from '~common/email/models';
import { makeId, makeUUID } from '~common/utils/short-uuid';

import { type EmailTemplate, type PrismaClient } from '~database/prisma/client';

export class EmailTemplateFixture {
  entity!: EmailTemplate;

  public static async fromPartial(
    prismaClient: PrismaClient,
    data?: Partial<EmailTemplate> & {
      cc?: string[];
      bcc?: string[];
      engineOptions?: Record<string, unknown>;
    },
  ) {
    const fixture = new EmailTemplateFixture();
    const now = new Date();

    fixture.entity = await prismaClient.emailTemplate.create({
      data: {
        ...data,
        id: data?.id ?? makeUUID(),
        name: data?.name ?? `test-template-${makeId()}`,
        engine: data?.engine ?? EmailCompilerType.HTML,
        subject: data?.subject ?? 'Test Subject',
        html: data?.html ?? '<p>Test HTML</p>',
        text: data?.text ?? 'Test Text',
        type: data?.type ?? EmailTemplateType.CUSTOM,
        module: data?.module ?? undefined,
        description: data?.description ?? undefined,
        from: data?.from ?? undefined,
        cc: data?.cc ? JSON.stringify(data.cc) : undefined,
        bcc: data?.bcc ? JSON.stringify(data.bcc) : undefined,
        engineOptions: data?.engineOptions ?? undefined,
        createdAt: data?.createdAt ?? now,
        updatedAt: data?.updatedAt ?? now,
      },
    });

    return fixture;
  }
}
