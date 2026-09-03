import type { JsonObject } from '~common/types';

export const PUSH_NOTIFICATION_TEMPLATE = 'push-notification-template';
export const PUSH_NOTIFICATION_TEMPLATE_CLASS_MARKER = 'PUSH_NOTIFICATION_TEMPLATE_CLASS_MARKER';

export interface IPushNotificationData {
  /**
   * Data payload
   *  passed as is to the device
   */
  data?: JsonObject;

  /**
   * Notification title
   */
  title?: string;

  /**
   * Notification body
   */
  body?: string;

  /**
   * Notification image URL
   */
  imageUrl?: string;
}

export interface IPushNotificationMessageBase extends IPushNotificationData {
  provider: string;
  providerOptions?: JsonObject;
}

export type IPushNotificationMessage = IPushNotificationMessageBase &
  ({ token: string | string[] } | { topic: string });

/**
 * Template data to expand the message data
 */
export interface IPushNotificationTemplateData {
  template?: string;
  templateValues?: JsonObject;
}

export interface IPushNotificationMessageResponse extends IPushNotificationMessageBase {
  token?: string | string[];
  topic?: string;

  response?: string;
  error?: Error | string;

  /**
   * Token/topic is invalid
   */
  invalidToken?: boolean;
  invalidTopic?: boolean;
}

export interface IPushNotificationSubscriptionResponse {
  token: string;
  error?: Error | string;

  /**
   * Token is invalid
   */
  invalidToken: boolean;
}
