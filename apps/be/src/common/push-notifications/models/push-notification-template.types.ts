import type { ClassConstructor } from 'class-transformer';

import { JsonObject } from '~common/types';

export enum PushNotificationTemplateType {
  CUSTOM = 'custom',
  SYSTEM = 'system',
}

export enum PushNotificationTemplateStatus {
  VALID = 'valid',
  INVALID = 'invalid',
}

/**
 * Template data to expand the message data
 */
export interface IPushNotificationTemplate {
  id?: string;

  /**
   * Template unique name
   */
  name: string;

  /**
   * Template type
   */
  type: PushNotificationTemplateType;

  /**
   * Template parameters
   */
  params?: {
    name: string;
    required: boolean;
  }[];

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

  /**
   * Template data
   */
  data?: JsonObject;

  /**
   * Module of the template
   */
  module?: string;

  /**
   * Description of the template
   */
  description?: string;

  /**
   * Created at timestamp
   */
  createdAt?: Date;

  /**
   * Updated at timestamp
   */
  updatedAt?: Date;

  /**
   * Status of the template
   */
  status?: PushNotificationTemplateStatus;
}

export interface IPushNotificationTemplateCreate {
  name: string;
  data?: JsonObject;
  module?: string;
  description?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  type: PushNotificationTemplateType;
}

export interface IPushNotificationTemplateUpdate {
  name?: string;
  data?: JsonObject;
  module?: string;
  description?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  type?: PushNotificationTemplateType;
}

/**
 * Template decorator options
 */
export interface IPushNotificationTemplateDecoratorOptions {
  /**
   * Default template
   */
  template: IPushNotificationTemplate;

  /**
   * Validation class using class-validator
   */
  validate?: ClassConstructor<object>;
}
