import type { JsonObject } from '~common/types';

export const EMAIL_TEMPLATE_METADATA = 'EMAIL_TEMPLATE_METADATA';
export const EMAIL_TEMPLATE_CLASS_MARKER = 'EMAIL_TEMPLATE_CLASS_MARKER';

export interface IEmailAttachment {
  /**
   * Base64 encoded data
   */
  data: string;
  contentId?: string;
  filename: string;
  contentType: string;
  description?: string;
  contentDisposition: 'ATTACHMENT' | 'INLINE';
}

export interface IEmailPartialData {
  /**
   * Recipient email address
   */
  to: string | string[];

  /**
   * Carbon copy email address to send to
   */
  cc?: string[];

  /**
   * Blind carbon copy address to send to
   */
  bcc?: string[];

  /**
   * Override from email address ( check provider permissions )
   */
  from?: string;

  /**
   * Override replyTo to email address
   */
  replyTo?: string | string[];

  /**
   * Email subject
   */
  subject: string;

  /**
   * Html content
   */
  htmlContent: string;

  /**
   * Text content ( displays on summaries )
   */
  textContent: string;

  /**
   * Attachments
   */
  attachments?: IEmailAttachment[];
}

export interface IEmailTemplateData<T = JsonObject> extends Partial<IEmailPartialData> {
  to: string | string[];

  /**
   * Build in template options
   */
  templateOptions?: {
    provider: string;
  };

  /**
   * Email template name
   */
  template?: string;

  /**
   * Email template name
   */
  templateValues?: T;

  /**
   * Email subject
   */
  subject?: string;

  /**
   * Html content
   */
  htmlContent?: string;

  /**
   * Text content ( displays on summaries )
   */
  textContent?: string;
}

export interface IEmailData<T = JsonObject> extends IEmailTemplateData<T> {
  /**
   * From email address
   */
  from: string;

  /**
   * Carbon copy email address to send to
   */
  cc?: string[];

  /**
   * Blind carbon copy address to send to
   */
  bcc?: string[];
}

export interface IEmailAddressJson {
  name?: string;
  email: string;
}

export interface IEmailSendResponse<T = JsonObject> {
  status: string;
  error?: Error;

  /**
   * Provider specific response
   */
  response?: T;
  messageId?: string;
}
