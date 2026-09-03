import { Injectable, type ModuleMetadata, OnApplicationBootstrap } from '@nestjs/common';

import { EmailLoader } from '../email.loader';
import { EmailProvider } from '../email-provider.abstract';
import type { IEmailData, IEmailSendResponse } from '../models';

export const NO_OP_PROVIDER_NAME = 'no-op';

@Injectable()
export class NoOpEmailProvider implements EmailProvider, OnApplicationBootstrap {
  readonly name = NO_OP_PROVIDER_NAME;

  constructor(private readonly loader: EmailLoader) {}

  onApplicationBootstrap() {
    this.loader.registerProvider(NO_OP_PROVIDER_NAME, this);
  }
  async send(): Promise<IEmailSendResponse> {
    return {
      status: 'no-op',
      messageId: 'no-op',
      response: undefined,
    };
  }

  public async preprocess(data: IEmailData): Promise<IEmailData> {
    return data;
  }
}

/**
 * Disable email provider by doing nothing on calls
 */
export const NoOpEmailProviderPlugin: ModuleMetadata = {
  providers: [NoOpEmailProvider],
  exports: [NoOpEmailProvider],
};
