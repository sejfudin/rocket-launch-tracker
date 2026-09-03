import { Injectable } from '@nestjs/common';

import type { IEmailData } from './models/email.types';
import type { IEmailTemplate } from './models/email-template.types';

/**
 * Convert an email template into a an email ready to send
 */
@Injectable()
export abstract class EmailCompiler {
  public abstract compile(data: IEmailData, template: IEmailTemplate): Promise<IEmailData>;
}
