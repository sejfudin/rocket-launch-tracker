import { mock } from 'node:test';

import { type IPagination } from '~common/http/pagination';
import { ISettingsSection, SettingsStatus } from '~common/settings/models';

import {
  type IPushNotificationMessageResponse,
  type IPushNotificationTemplate,
  type IPushNotificationTemplateCreate,
  type IPushNotificationTemplateUpdate,
  type IPushNotificationToken,
  type IPushNotificationTokenCreate,
  PushNotificationTemplateType,
} from '../models';
import { PushNotificationService } from '../push-notification.service';
import { PushNotificationProvider } from '../push-notification-provider.abstract';
import { PushNotificationTemplateProvider } from '../push-notification-template-provider.abstract';
import { PushNotificationTokenService } from '../push-notification-token.service';
import { PushNotificationTokenPersistor } from '../push-notification-token-persistor.abstract';
import { type ProviderMock } from '~test/utils';

export const examplePushNotificationToken: IPushNotificationToken = {
  id: 'mock-token-id',
  resourceName: 'mock-resource-name',
  token: 'mock-device-token',
  provider: 'fcm',
  title: 'Mock Device',
  module: undefined,
  resourceId: undefined,
  expiresAt: undefined,
  createdAt: new Date(),
};

export const examplePushNotificationMessageResponse: IPushNotificationMessageResponse = {
  provider: 'fcm',
  token: 'mock-device-token',
  response: 'success',
};

export const examplePushNotificationTemplate: IPushNotificationTemplate = {
  id: 'mock-template-id',
  name: 'mock-template',
  type: PushNotificationTemplateType.SYSTEM,
  params: undefined,
  title: 'Mock Title',
  body: 'Mock Body',
  imageUrl: undefined,
  module: undefined,
  description: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock all calls to PushNotificationService
 */
export const PushNotificationServiceMock: ProviderMock<PushNotificationService> = {
  provide: PushNotificationService,
  useValue: {
    send: mock.fn(async () => {
      return [examplePushNotificationMessageResponse];
    }),
    sendTemplate: mock.fn(async () => {
      return [examplePushNotificationMessageResponse];
    }),
    sendProviderMessage: mock.fn(async () => {
      return [examplePushNotificationMessageResponse];
    }),
  },
};

/**
 * Mock all calls to PushNotificationTokenService
 */
export const PushNotificationTokenServiceMock: ProviderMock<PushNotificationTokenService> = {
  provide: PushNotificationTokenService,
  useValue: {
    listToken: mock.fn(async () => {
      return [examplePushNotificationToken];
    }),
    paginateToken: mock.fn(async (): Promise<IPagination<IPushNotificationToken>> => {
      return {
        items: [examplePushNotificationToken],
        totalItems: 1,
        page: 1,
        limit: 10,
      };
    }),
    registerToken: mock.fn(async () => {
      return examplePushNotificationToken;
    }),
    deleteToken: mock.fn(async () => {
      return 1;
    }),
    listLabels: mock.fn(async () => {
      return [{ id: 'mock-provider', label: 'Mock Provider' }];
    }),
  },
};

/**
 * Mock calls to Push Notification Providers
 */
export const PushNotificationProviderMock: ProviderMock<PushNotificationProvider> & { provider: string } = {
  provider: 'fcm',
  provide: PushNotificationProvider,
  useValue: {
    sendMessage: mock.fn(async (): Promise<IPushNotificationMessageResponse[]> => {
      return [examplePushNotificationMessageResponse];
    }),
    validate: mock.fn(async <T extends { token: string }>(data: T) => {
      return { ...data, expiresAt: undefined };
    }),
    getSettings: mock.fn(async (): Promise<ISettingsSection> => {
      return { name: 'mock-provider', status: SettingsStatus.Ok };
    }),
  },
};

/**
 * Mock calls to Push Notification Token Persistor
 */
export const PushNotificationTokenPersistorMock: ProviderMock<PushNotificationTokenPersistor> = {
  provide: PushNotificationTokenPersistor,
  useValue: {
    find: mock.fn(async () => {
      return examplePushNotificationToken;
    }),
    list: mock.fn(async (options?: { where: any }) => {
      let items = [examplePushNotificationToken];
      if (Array.isArray(options?.where.id)) {
        items = options.where.id.map((id: string) => ({ ...examplePushNotificationToken, id }));
      }
      if (Array.isArray(options?.where.token)) {
        items = options.where.token.map((token: string) => ({ ...examplePushNotificationToken, token }));
      }
      if (Array.isArray(options?.where.resourceName)) {
        items = options.where.resourceName.map((resourceName: string) => ({
          ...examplePushNotificationToken,
          resourceName,
        }));
      }
      if (options?.where.resourceName && typeof options.where.resourceName === 'string') {
        items = [{ ...examplePushNotificationToken, resourceName: options.where.resourceName }];
      }
      return items;
    }),
    paginate: mock.fn(async (): Promise<IPagination<IPushNotificationToken>> => {
      return {
        items: [examplePushNotificationToken],
        totalItems: 1,
        page: 1,
        limit: 10,
      };
    }),
    create: mock.fn(async (data: IPushNotificationTokenCreate) => {
      return {
        ...examplePushNotificationToken,
        ...data,
        id: data.id ?? examplePushNotificationToken.id,
        createdAt: new Date(),
      };
    }),
    update: mock.fn(async (where: { id: string }, data: Partial<IPushNotificationToken>) => {
      return { ...examplePushNotificationToken, ...where, ...data };
    }),
    delete: mock.fn(async () => {
      return 1;
    }),
    listLabels: mock.fn(async () => {
      return [{ id: 'mock-token-id', label: 'Mock Token' }];
    }),
  },
};

/**
 * Mock calls to Push Notification Template Provider
 */
export const PushNotificationTemplateProviderMock: ProviderMock<PushNotificationTemplateProvider> = {
  provide: PushNotificationTemplateProvider,
  useValue: {
    find: mock.fn(async () => {
      return examplePushNotificationTemplate;
    }),
    paginate: mock.fn(async (): Promise<IPagination<IPushNotificationTemplate>> => {
      return {
        items: [examplePushNotificationTemplate],
        totalItems: 1,
        page: 1,
        limit: 10,
      };
    }),
    list: mock.fn(async () => {
      return [examplePushNotificationTemplate];
    }),
    create: mock.fn(async (data: IPushNotificationTemplateCreate) => {
      return {
        ...examplePushNotificationTemplate,
        ...data,
        id: examplePushNotificationTemplate.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    update: mock.fn(async (where: { name: string } | { id: string }, data: IPushNotificationTemplateUpdate) => {
      return { ...examplePushNotificationTemplate, ...where, ...data };
    }),
    delete: mock.fn(async () => {
      return;
    }),
    listLabels: mock.fn(async () => {
      return [{ id: 'mock-template-id', label: 'Mock Template' }];
    }),
  },
};
