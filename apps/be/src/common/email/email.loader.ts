import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { LoggerService } from '~common/logger';
import { MetadataService } from '~common/utils/nestjs';

import { EmailPreprocessorError } from './email.exceptions';
import { EmailCompiler } from './email-compiler.abstract';
import { EmailProvider } from './email-provider.abstract';
import {
  EMAIL_TEMPLATE_CLASS_MARKER,
  EMAIL_TEMPLATE_METADATA,
  EmailCompilerType,
  EmailTemplateType,
  IEmailData,
  IEmailTemplate,
  IEmailTemplateMetadata,
} from './models';

@Injectable()
export class EmailLoader implements OnApplicationBootstrap {
  constructor(
    private readonly logger: LoggerService,
    private readonly metadataService: MetadataService,
  ) {}

  onApplicationBootstrap() {
    this.loadStaticTemplates();
  }

  private loadStaticTemplates() {
    for (const { metadata, handler } of this.metadataService.getAllHandlers<
      IEmailTemplateMetadata,
      [IEmailData],
      IEmailData
    >(EMAIL_TEMPLATE_METADATA, {
      provider: true,
      classMarker: EMAIL_TEMPLATE_CLASS_MARKER,
    })) {
      metadata.forEach((m) => {
        this.registerStaticTemplate(m, handler);
      });
    }
  }

  /**
   * Templates loaded at start
   */
  public readonly staticTemplates: Record<
    string,
    {
      templateOptions: IEmailTemplateMetadata & { template: IEmailTemplate };
      templateFunction: (data: IEmailData) => Promise<IEmailData>;
    }
  > = {};

  public registerStaticTemplate(
    templateOptions: IEmailTemplateMetadata,
    templateFunction: (data: IEmailData) => Promise<IEmailData>,
  ): void {
    const name =
      typeof templateOptions.template === 'string' ? templateOptions.template : templateOptions.template.name;

    const computedTemplateOptions: IEmailTemplateMetadata & { template: IEmailTemplate } = {
      template:
        typeof templateOptions.template === 'string'
          ? {
              name: templateOptions.template,
              engine: EmailCompilerType.EXTERNAL,
              type: EmailTemplateType.SYSTEM,
            }
          : {
              ...templateOptions.template,
              type: EmailTemplateType.SYSTEM,
            },
      validate: templateOptions.validate,
    };

    if (!computedTemplateOptions.template.params && templateOptions.validate) {
      computedTemplateOptions.template.params = Object.keys(new templateOptions.validate()).map((key) => {
        return {
          name: key,
          required: true,
        };
      });
    }

    if (name in this.staticTemplates) {
      throw new Error(`Template ${name} already registered`);
    }
    this.logger.debug(`Registered static template {${name}}`);
    this.staticTemplates[name] = {
      templateOptions: computedTemplateOptions,
      templateFunction: (...args) => {
        try {
          return templateFunction(...args);
        } catch (error) {
          throw new EmailPreprocessorError(`Error processing template {${name}}`, {
            cause: error,
          });
        }
      },
    };
  }

  /**
   * Template compilers
   */
  public readonly templateCompilers: Record<string, EmailCompiler> = {};

  public registerTemplateCompiler(name: string, compiler: EmailCompiler): void {
    if (name in this.templateCompilers) {
      throw new Error(`Compiler ${name} already registered`);
    }
    this.logger.debug(`Registered compiler {${name}}`);
    this.templateCompilers[name] = compiler;
  }

  /**
   * Registered email providers
   */
  public providers: Record<string, EmailProvider> = {};

  /**
   * Register an email provider by name
   */
  public registerProvider(name: string, provider: EmailProvider): void {
    if (name in this.providers) {
      throw new Error(`Provider ${name} already registered`);
    }
    this.logger.debug(`Registered provider {${name}}`);
    this.providers[name] = provider;
  }
}
