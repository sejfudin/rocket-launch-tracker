import { ClassConstructor } from 'class-transformer';

import { JsonObject } from '~common/types';

import { IEmailAttachment } from './email.types';
import { EmailCompilerType } from './email-compiler.types';

export enum EmailTemplateType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

export enum EmailTemplateStatus {
  VALID = 'valid',
  INVALID = 'invalid',
}

/**
 * Email template definition options
 */
export interface IEmailTemplateMetadata {
  /**
   * Default template
   */
  template: IEmailTemplate;

  /**
   * Validation class using class-validator
   */
  validate?: ClassConstructor<object>;
}

export interface IEmailTemplate {
  /**
   * Optional Id
   */
  id?: string;

  /**
   * Template unique name
   */
  name: string;

  /**
   * Engine to use for rendering the template
   *  - `mjml` for MJML, simple {{ interpolation }} is supported
   *  - `html` for wrapping content into a simple html body, with {{ interpolation }}
   *  - none for only {{ interpolation }}
   */
  engine: EmailCompilerType;

  /**
   * Engine options
   */
  engineOptions?: JsonObject & { externalTemplate?: string };

  /**
   * Template parameters
   */
  params?: {
    name: string;
    required: boolean;
  }[];

  /**
   * Template type
   */
  type?: EmailTemplateType;

  /**
   * Template to interpolate with the data
   */
  html?: string;

  /**
   * Text version of the template
   */
  text?: string;

  /**
   * Subject to interpolate with the data
   */
  subject?: string;

  /**
   * Default from
   */
  from?: string;

  /**
   * Carbon copy email address to send to
   */
  cc?: string[];

  /**
   * Blind carbon copy address to send to
   */
  bcc?: string[];

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
  status?: EmailTemplateStatus;

  /**
   * Attachments
   */
  attachments?: IEmailAttachment[];
}

export interface IEmailTemplateCreate extends IEmailTemplate {}

export interface IEmailTemplateUpdate extends Partial<IEmailTemplate> {}
