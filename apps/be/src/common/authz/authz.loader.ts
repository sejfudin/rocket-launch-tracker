import { Injectable } from '@nestjs/common';

import { LoggerService } from '~common/logger';

import { AuthzProvider } from './authz-provider.abstract';

@Injectable()
export class AuthzLoader {
  constructor(private readonly logger: LoggerService) {}

  public providers: Record<string, AuthzProvider> = {};

  /**
   * Register an authn provider by name
   */
  public registerProvider(name: string, provider: AuthzProvider): void {
    if (name in this.providers) {
      throw new Error(`Provider ${name} already registered`);
    }
    this.logger.debug(`Registered provider {${name}}`);
    this.providers[name] = provider;
  }
}
