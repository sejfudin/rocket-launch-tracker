import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, it } from 'vitest';

import { LoggerModule } from '~common/logger';

import { PushNotificationLoader } from '../push-notification.loader';
import { PushNotificationModule } from '../push-notification.module';
import { PushNotificationService } from '../push-notification.service';
import { PushNotificationProvider } from '../push-notification-provider.abstract';
import { MyPushNotificationTemplate, MyPushNotificationTemplateProvider } from './push-notificaiton-template.mock';
import {
  PushNotificationProviderMock,
  PushNotificationTokenPersistorMock,
  examplePushNotificationMessageResponse,
  examplePushNotificationToken,
} from './push-notification.mock';

describe('PushNotificationService', () => {
  let app: INestApplication;
  let pushNotificationService: PushNotificationService;
  let pushNotificationLoader: PushNotificationLoader;
  let providerSendMessage: typeof PushNotificationProviderMock.useValue.sendMessage;
  let tokenPersistorList: typeof PushNotificationTokenPersistorMock.useValue.list;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, PushNotificationModule.forRoot([{ providers: [PushNotificationTokenPersistorMock] }])],
      providers: [MyPushNotificationTemplateProvider],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    pushNotificationService = app.get(PushNotificationService);
    pushNotificationLoader = app.get(PushNotificationLoader);

    pushNotificationLoader.providers = {
      [PushNotificationProviderMock.provider]: PushNotificationProviderMock.useValue as PushNotificationProvider,
    };

    providerSendMessage = PushNotificationProviderMock.useValue.sendMessage;
    tokenPersistorList = PushNotificationTokenPersistorMock.useValue.list;
  });

  afterAll(async () => {
    providerSendMessage.mock.resetCalls();
    tokenPersistorList.mock.resetCalls();
  });

  it('should send message to tokens', async ({ expect }) => {
    tokenPersistorList.mock.mockImplementationOnce(async () => {
      return [examplePushNotificationToken];
    });

    const result = await pushNotificationService.send({
      tokens: ['mock-device-token'],
      title: 'Test Title',
      body: 'Test Body',
    });

    expect(result).toEqual([examplePushNotificationMessageResponse]);
    expect(tokenPersistorList.mock.calls).toHaveLength(1);
    expect(providerSendMessage.mock.calls).toHaveLength(1);
  });

  it('should send message to resource name', async ({ expect }) => {
    tokenPersistorList.mock.mockImplementationOnce(async () => {
      return [examplePushNotificationToken];
    });

    const result = await pushNotificationService.send({
      resourceName: 'test-resource',
      title: 'Test Title',
      body: 'Test Body',
    });

    expect(result).toEqual([examplePushNotificationMessageResponse]);
    expect(tokenPersistorList.mock.calls.length).toBeGreaterThan(0);
    expect(providerSendMessage.mock.calls.length).toBeGreaterThan(0);
  });

  it('should send template message', async ({ expect }) => {
    tokenPersistorList.mock.mockImplementationOnce(async () => {
      return [examplePushNotificationToken];
    });

    const result = await pushNotificationService.sendTemplate(
      {
        resourceName: 'test-resource',
        data: { key: 'value' },
      },
      MyPushNotificationTemplate.name,
      { name: 'John', code: '123456' },
    );

    expect(result).toEqual([examplePushNotificationMessageResponse]);
  });
});
