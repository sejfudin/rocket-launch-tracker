import { Injectable, ModuleMetadata, OnApplicationBootstrap } from '@nestjs/common';

import { EmailPreprocessorError } from '~common/email/email.exceptions';
import type { JsonObject } from '~common/types';

import { EmailLoader } from '../email.loader';
import { EmailCompiler } from '../email-compiler.abstract';
import type { IEmailData, IEmailTemplate } from '../models';

@Injectable()
export class HtmlEmailCompiler implements EmailCompiler, OnApplicationBootstrap {
  constructor(private readonly loader: EmailLoader) {}

  onApplicationBootstrap() {
    this.loader.registerTemplateCompiler('html', this);
  }

  private replaceTemplateValues(templateString: string, values?: JsonObject): string {
    if (values && Object.keys(values).length > 0) {
      for (const [key, value] of Object.entries(values)) {
        const stringValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
        templateString = templateString.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), stringValue);
      }
    }
    return templateString;
  }

  public async compile(data: IEmailData, template: IEmailTemplate): Promise<IEmailData> {
    if (!template.subject || !template.html) {
      const templateName = data.template ?? template.name;
      throw new EmailPreprocessorError(
        `Email template: ${templateName} is not setup correctly for HTML compiling.
         Subject and html must be set in the template data`,
        {
          code: 'email-template-not-setup-for-html-compilation',
          details: { hint: { message: `Setup subject and html in template ${templateName}` } },
        },
      );
    }

    data.subject = this.replaceTemplateValues(template.subject, data.templateValues);
    data.textContent = template.text ? this.replaceTemplateValues(template.text, data.templateValues) : undefined;

    /**
     * Wrap in a simple, full HTML document
     *  - <style> does not work in most email clients
     */
    data.htmlContent = [
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>`,
      this.replaceTemplateValues(template.html, data.templateValues),
      '</body></html>',
    ].join('');

    delete data.template;
    delete data.templateValues;
    delete data.templateOptions;
    return data;
  }
}

export const HtmlEmailCompilerPlugin: ModuleMetadata = {
  providers: [HtmlEmailCompiler],
};
