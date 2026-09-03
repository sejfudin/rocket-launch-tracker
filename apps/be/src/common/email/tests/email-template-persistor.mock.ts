import { mock } from 'node:test';

import { EmailTemplateProvider } from '~common/email/email-template-provider.abstract';
import { EmailCompilerType, IEmailTemplate, IEmailTemplateUpdate } from '~common/email/models';
import type { IPagination } from '~common/http/pagination';

import type { ProviderMock } from '~test/utils';

/**
 * Mock Fetching Email Templates
 */
export const EmailTemplateProviderMock: ProviderMock<EmailTemplateProvider> = {
  provide: EmailTemplateProvider,
  useValue: {
    find: mock.fn((where: { name: string } | { id: string }) => {
      return Promise.resolve({
        id: 'id' in where ? where.id : 'mock-id',
        name: 'name' in where ? where.name : 'mock-name',
        engine: EmailCompilerType.HTML,
        html: '<b>Hey {{name}}</b>',
        text: 'Hey {{name}}',
        subject: 'Hello {{nane}}',
      } satisfies IEmailTemplate);
    }),
    paginate: mock.fn(() => {
      return Promise.resolve({ items: [], totalItems: 0, limit: 10 } satisfies IPagination<IEmailTemplate>);
    }),
    list: mock.fn(() => {
      return Promise.resolve([]);
    }),
    create: mock.fn(
      (data: Omit<IEmailTemplate, 'id'>): Promise<IEmailTemplate> =>
        Promise.resolve({
          id: 'mock-id',
          ...data,
        }),
    ),
    update: mock.fn(
      (where: { name: string } | { id: string }, data: IEmailTemplateUpdate): Promise<IEmailTemplate> =>
        Promise.resolve({
          id: 'mock-id',
          name: 'mock-name',
          engine: EmailCompilerType.HTML,
          html: '<b>Mock HTML</b>',
          text: 'Mock text',
          subject: 'Mock subject',
          ...data,
          ...where,
        }),
    ),
    delete: mock.fn(() => {
      return Promise.resolve();
    }),
    listLabels: mock.fn(() => {
      return Promise.resolve([]);
    }),
  },
};
