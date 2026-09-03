import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, it } from 'vitest';

import { LoggerModule } from '~common/logger';
import { PushNotificationLoader } from '~common/push-notifications/push-notification.loader';
import { PushNotificationModule } from '~common/push-notifications/push-notification.module';
import { PushNotificationProvider } from '~common/push-notifications/push-notification-provider.abstract';
import { PushNotificationTokenService } from '~common/push-notifications/push-notification-token.service';

import {
  PushNotificationProviderMock,
  PushNotificationTokenPersistorMock,
  examplePushNotificationToken,
} from './push-notification.mock';

describe('PushNotificationTokenService', () => {
  let app: INestApplication;
  let pushNotificationTokenService: PushNotificationTokenService;
  let pushNotificationLoader: PushNotificationLoader;
  let tokenPersistorList: typeof PushNotificationTokenPersistorMock.useValue.list;
  let tokenPersistorCreate: typeof PushNotificationTokenPersistorMock.useValue.create;
  let tokenPersistorDelete: typeof PushNotificationTokenPersistorMock.useValue.delete;
  let providerValidate: typeof PushNotificationProviderMock.useValue.validate;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, PushNotificationModule.forRoot([{ providers: [PushNotificationTokenPersistorMock] }])],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    pushNotificationTokenService = app.get(PushNotificationTokenService);
    pushNotificationLoader = app.get(PushNotificationLoader);

    pushNotificationLoader.providers = {
      [PushNotificationProviderMock.provider]: PushNotificationProviderMock.useValue as PushNotificationProvider,
    };

    tokenPersistorList = PushNotificationTokenPersistorMock.useValue.list;
    tokenPersistorCreate = PushNotificationTokenPersistorMock.useValue.create;
    tokenPersistorDelete = PushNotificationTokenPersistorMock.useValue.delete;
    providerValidate = PushNotificationProviderMock.useValue.validate;
  });

  it('should list tokens', async ({ expect }) => {
    tokenPersistorList.mock.resetCalls();
    tokenPersistorList.mock.mockImplementationOnce(async () => {
      return [examplePushNotificationToken];
    });

    const result = await pushNotificationTokenService.listToken({
      where: {
        resourceName: 'test-resource',
      },
    });

    expect(result).toEqual([examplePushNotificationToken]);
    expect(tokenPersistorList.mock.calls).toHaveLength(1);
  });

  it('should paginate tokens', async ({ expect }) => {
    const result = await pushNotificationTokenService.paginateToken({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      items: [examplePushNotificationToken],
      totalItems: 1,
      page: 1,
      limit: 10,
    });
  });

  it('should register token with default provider', async ({ expect }) => {
    providerValidate.mock.resetCalls();
    tokenPersistorCreate.mock.resetCalls();
    providerValidate.mock.mockImplementationOnce(async (data) => {
      return { ...data, expiresAt: undefined };
    });

    tokenPersistorCreate.mock.mockImplementationOnce(async (data) => {
      return {
        ...examplePushNotificationToken,
        ...data,
        id: data.id ?? examplePushNotificationToken.id,
        createdAt: new Date(),
      };
    });

    const result = await pushNotificationTokenService.registerToken({
      resourceName: 'test-resource',
      token: 'test-token',
    });

    expect(result).toBeDefined();
    expect(providerValidate.mock.calls).toHaveLength(1);
    expect(tokenPersistorCreate.mock.calls).toHaveLength(1);
  });

  it('should register token with specified provider', async ({ expect }) => {
    providerValidate.mock.resetCalls();
    tokenPersistorCreate.mock.resetCalls();
    providerValidate.mock.mockImplementationOnce(async (data) => {
      return { ...data, expiresAt: undefined };
    });

    tokenPersistorCreate.mock.mockImplementationOnce(async (data) => {
      return {
        ...examplePushNotificationToken,
        ...data,
        id: data.id ?? examplePushNotificationToken.id,
        createdAt: new Date(),
      };
    });

    const result = await pushNotificationTokenService.registerToken({
      resourceName: 'test-resource',
      token: 'test-token',
      provider: 'fcm',
    });

    expect(result).toBeDefined();
    expect(providerValidate.mock.calls).toHaveLength(1);
    expect(tokenPersistorCreate.mock.calls).toHaveLength(1);
  });

  it('should replace existing token when replace option is true', async ({ expect }) => {
    providerValidate.mock.resetCalls();
    tokenPersistorDelete.mock.resetCalls();
    tokenPersistorCreate.mock.resetCalls();
    providerValidate.mock.mockImplementationOnce(async (data) => {
      return { ...data, expiresAt: undefined };
    });

    tokenPersistorDelete.mock.mockImplementationOnce(async () => {
      return 1;
    });

    tokenPersistorCreate.mock.mockImplementationOnce(async (data) => {
      return {
        ...examplePushNotificationToken,
        ...data,
        id: data.id ?? examplePushNotificationToken.id,
        createdAt: new Date(),
      };
    });

    const result = await pushNotificationTokenService.registerToken(
      {
        resourceName: 'test-resource',
        token: 'test-token',
      },
      { replace: true },
    );

    expect(result).toBeDefined();
    expect(tokenPersistorDelete.mock.calls).toHaveLength(1);
    expect(tokenPersistorCreate.mock.calls).toHaveLength(1);
  });
});
