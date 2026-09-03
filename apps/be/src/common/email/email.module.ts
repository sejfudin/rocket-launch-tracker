import { DynamicModule, Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { ExternalEmailCompiler } from '~common/email/compilers/external.email-compiler';
import { HtmlEmailCompiler } from '~common/email/compilers/html.email-compiler';
import { SettingsModule } from '~common/settings';
import { MetadataModule, deferComposableModule } from '~common/utils/nestjs';

import { EmailConfig } from './email.config';
import { EmailLoader } from './email.loader';
import { EmailService } from './email.service';
import { EmailSettingsProvider } from './email-settings.provider';

@Module({})
export class EmailModule {
  static forRoot = deferComposableModule({
    module: EmailModule,
    imports: [MetadataModule, SettingsModule],
    providers: [
      //
      EmailService,
      getConfigFactory(EmailConfig),
      EmailLoader,
      HtmlEmailCompiler,
      ExternalEmailCompiler,
      EmailSettingsProvider,
    ],
    exports: [EmailService, EmailLoader],
  });

  static forFeature(): Promise<DynamicModule> {
    return this.forRoot();
  }
}
