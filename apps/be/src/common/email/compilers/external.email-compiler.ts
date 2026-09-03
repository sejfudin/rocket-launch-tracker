import { Injectable, ModuleMetadata, OnApplicationBootstrap } from '@nestjs/common';

import { EmailLoader } from '../email.loader';
import { EmailCompiler } from '../email-compiler.abstract';
import type { IEmailData } from '../models/email.types';
import { IEmailTemplate } from '../models/email-template.types';

@Injectable()
export class ExternalEmailCompiler implements EmailCompiler, OnApplicationBootstrap {
  constructor(private readonly loader: EmailLoader) {}

  onApplicationBootstrap() {
    this.loader.registerTemplateCompiler('external', this);
  }

  public async compile(data: IEmailData, template: IEmailTemplate): Promise<IEmailData> {
    if (template.engineOptions?.externalTemplate) {
      data.template = template.engineOptions.externalTemplate;
    }
    data.templateOptions = data.templateOptions
      ? { ...data.templateOptions, provider: 'external' }
      : { provider: 'external' };
    return data;
  }
}

export const ExternalEmailCompilerPlugin: ModuleMetadata = {
  providers: [ExternalEmailCompiler],
};
