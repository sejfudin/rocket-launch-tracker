import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { BadRequestException } from '~common/exceptions';
import { ISettingsSection, SettingsPopulate, SettingsSettingAction, SettingsStatus } from '~common/settings';
import type { JsonObject, JsonValue } from '~common/types';

import type {
  IPushNotificationMessage,
  IPushNotificationMessageResponse,
  IPushNotificationSubscriptionResponse,
} from '../../models';
import { PushNotificationLoader } from '../../push-notification.loader';
import { PushNotificationProvider } from '../../push-notification-provider.abstract';
import { FcmPushNotificationConfig } from './fcm-push-notification.config';
import { FCM_PUSH_NOTIFICATION_PROVIDER_NAME } from './fcm-push-notification.constants';
import type {
  AccessTokenResponse,
  FcmErrorResponse,
  FcmSendResponse,
  TopicSubscriptionResponse,
} from './fcm-push-notification.types';

export const FCM_OAUTH2_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const FCM_OAUTH2_AUDIENCE = 'https://oauth2.googleapis.com/token';
export const FCM_OAUTH2_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
export const FCM_MESSAGING_API_BASE_URL = 'https://fcm.googleapis.com/v1/projects';
export const FCM_INSTANCE_ID_API_BASE_URL = 'https://iid.googleapis.com/iid/v1';
export const FCM_TOKEN_CACHE_BUFFER_MS = 60000;
export const FCM_JWT_EXPIRY_SECONDS = 3600;

@Injectable()
export class FcmPushNotificationProvider implements PushNotificationProvider, OnApplicationBootstrap {
  constructor(
    private readonly config: FcmPushNotificationConfig,
    private readonly loader: PushNotificationLoader,
  ) {
    if (this.config.enabled) {
      if (!this.config.projectId || !this.config.clientEmail || !this.config.privateKey) {
        throw new Error(
          'FCM Provider Init Failed: Missing required configuration (projectId, clientEmail, or privateKey)',
        );
      }
    }
  }

  onApplicationBootstrap() {
    this.loader.registerProvider(FCM_PUSH_NOTIFICATION_PROVIDER_NAME, this);
  }

  private accessTokenCache: { token: string; expiresAt: number } | null = null;

  private get projectId(): string {
    if (!this.config.projectId) {
      throw new Error('FCM Provider: projectId is required');
    }
    return this.config.projectId;
  }

  private get isConfigured(): boolean {
    return Boolean(this.config.enabled && this.config.projectId && this.config.clientEmail && this.config.privateKey);
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessTokenCache && this.accessTokenCache.expiresAt > Date.now() + FCM_TOKEN_CACHE_BUFFER_MS) {
      return this.accessTokenCache.token;
    }

    if (!this.config.projectId || !this.config.clientEmail || !this.config.privateKey) {
      throw new Error('FCM Provider: Missing required configuration');
    }

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: this.config.clientEmail,
      sub: this.config.clientEmail,
      aud: FCM_OAUTH2_AUDIENCE,
      iat: now,
      exp: now + FCM_JWT_EXPIRY_SECONDS,
      scope: FCM_OAUTH2_SCOPE,
    };

    const jwtToken = jwt.sign(jwtPayload, this.config.privateKey, { algorithm: 'RS256' });

    const response = await fetch(FCM_OAUTH2_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as AccessTokenResponse;
    this.accessTokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
  }

  private buildFcmData(data?: JsonObject): Record<string, string> | undefined {
    if (!data) {
      return undefined;
    }
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)]),
    );
  }

  private buildFcmPayload(
    message: IPushNotificationMessage,
    destination?: { token?: string; topic?: string },
  ): Record<string, JsonValue> {
    const fcmData = this.buildFcmData(message.data);
    const basePayload: Record<string, JsonValue> = {
      ...(message.providerOptions as Record<string, JsonValue>),
    };

    if (fcmData) {
      basePayload.data = fcmData;
    }

    if (message.title || message.body || message.imageUrl) {
      basePayload.notification = {
        ...(message.providerOptions?.notification as Record<string, JsonValue>),
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
      } as JsonValue;
    }

    if (destination) {
      if (destination.token) {
        basePayload.token = destination.token;
      }
      if (destination.topic) {
        basePayload.topic = destination.topic;
      }
    }

    return basePayload;
  }

  private isInvalidTokenError(status: string, message: string): boolean {
    return status === 'INVALID_ARGUMENT' || status === 'NOT_FOUND' || message.includes('UNREGISTERED');
  }

  private async sendFcmMessage(
    projectId: string,
    accessToken: string,
    payload: Record<string, JsonValue>,
  ): Promise<FcmSendResponse> {
    const response = await fetch(`${FCM_MESSAGING_API_BASE_URL}/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: payload }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as FcmErrorResponse;
      throw new Error(errorData.error.message);
    }

    return (await response.json()) as FcmSendResponse;
  }

  public async sendMessage(message: IPushNotificationMessage): Promise<IPushNotificationMessageResponse[]> {
    const projectId = this.projectId;
    const accessToken = await this.getAccessToken();

    if ('token' in message && Array.isArray(message.token)) {
      const basePayload = this.buildFcmPayload(message);
      const sendPromises = message.token.map(async (token) => {
        const payload = { ...basePayload, token } as Record<string, JsonValue>;
        try {
          const data = await this.sendFcmMessage(projectId, accessToken, payload);
          return {
            ...message,
            token,
            response: data.name,
            invalidToken: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isInvalidToken = this.isInvalidTokenError('', errorMessage);
          return {
            ...message,
            token,
            error: errorMessage,
            invalidToken: isInvalidToken,
          };
        }
      });
      return Promise.all(sendPromises);
    }

    const destination: { topic?: string; token?: string } =
      'topic' in message ? { topic: message.topic } : { token: message.token as string };
    const payload = this.buildFcmPayload(message, destination);

    try {
      const data = await this.sendFcmMessage(projectId, accessToken, payload);
      return [
        {
          ...message,
          ...destination,
          response: data.name,
          invalidToken: false,
        },
      ];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isInvalidToken = this.isInvalidTokenError('', errorMessage);
      return [
        {
          ...message,
          ...destination,
          error: errorMessage,
          invalidToken: isInvalidToken,
          invalidTopic: 'topic' in destination && isInvalidToken,
        },
      ];
    }
  }

  public async validate<T extends { token: string }>(data: T): Promise<T & { expiresAt?: Date }> {
    const projectId = this.projectId;
    const accessToken = await this.getAccessToken();

    try {
      await this.sendFcmMessage(projectId, accessToken, {
        token: data.token,
        data: { validate: 'true' },
      } as Record<string, JsonValue>);
      return data;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Invalid token', { cause: new Error(errorMessage) });
    }
  }

  private async handleTopicSubscription<T extends IPushNotificationSubscriptionResponse>(
    tokens: T[],
    topic: string,
    url: string,
  ): Promise<T[]> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: `/topics/${topic}`,
          registration_tokens: tokens.map((x) => x.token),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return tokens.map((token) => ({
          ...token,
          error: errorText,
          invalidToken: false,
        }));
      }

      const data = (await response.json()) as TopicSubscriptionResponse;
      return tokens.map((token, i) => {
        const result = data.results[i];
        return {
          ...token,
          error: result.error ? String(result.error) : undefined,
          invalidToken: false,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return tokens.map((token) => ({
        ...token,
        error: errorMessage,
        invalidToken: false,
      }));
    }
  }

  /**
   * FCM Specific Subscribe To Topic
   *  - this could be used for mass-messaging, not useful for single targets
   *  - Uses legacy Instance ID API for topic subscriptions
   */
  public async subscribeToTopic<T extends IPushNotificationSubscriptionResponse>(
    tokens: T[],
    topic: string,
  ): Promise<T[]> {
    return this.handleTopicSubscription(tokens, topic, `${FCM_INSTANCE_ID_API_BASE_URL}:batchAdd`);
  }

  /**
   * FCM Specific Unsubscribe From Topic
   *  - Uses legacy Instance ID API for topic unsubscriptions
   */
  public async unsubscribeFromTopic<T extends IPushNotificationSubscriptionResponse>(
    tokens: T[],
    topic: string,
  ): Promise<T[]> {
    return this.handleTopicSubscription(tokens, topic, `${FCM_INSTANCE_ID_API_BASE_URL}:batchRemove`);
  }

  public async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    let status = SettingsStatus.Disabled;
    let statusMessage = 'Disabled';

    if (this.config.enabled) {
      // todo, make some kind of connection test
      status = SettingsStatus.Ok;
      statusMessage = 'Push notifications are sent via Google FCM';
    }

    const prefix = `push-notification.${FCM_PUSH_NOTIFICATION_PROVIDER_NAME}`;

    return {
      name: prefix,
      label: 'Google FCM',
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: `${prefix}.projectId`,
              label: 'FCM Project ID',
              value: this.config.projectId,
              actions: [SettingsSettingAction.Copy],
            },
            {
              name: `${prefix}.clientEmail`,
              label: 'FCM Client Email',
              value: this.config.clientEmail,
              actions: [SettingsSettingAction.Copy],
            },
          ]
        : undefined,
    };
  }
}
