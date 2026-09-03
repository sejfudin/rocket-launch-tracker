import { AbilityBuilder } from '@casl/ability';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { AuthzLoader } from '~common/authz/authz.loader';
import { AppAbility, AuthzProvider } from '~common/authz/authz-provider.abstract';

import { USER_AUTHN_KEY } from '~modules/users/auth/user-auth.constants';
import { IUserAuthRequestUser } from '~modules/users/auth/user-auth.types';

@Injectable()
export class UserAuthAuthz implements AuthzProvider, OnModuleInit {
  constructor(private readonly authzLoader: AuthzLoader) {}

  onModuleInit() {
    this.authzLoader.registerProvider(USER_AUTHN_KEY, this);
  }

  async applyRules(request: { user: IUserAuthRequestUser }, builder: AbilityBuilder<AppAbility>): Promise<void> {
    if (request.user.namespace === USER_AUTHN_KEY) {
      for (const role of request.user.roles || []) {
        switch (role) {
          case 'manager':
            builder.can('manage', 'rocket');
            break;
          case 'client':
            builder.can('read', 'rocket', { ownerId: request.user.userId });
            builder.can('create', 'rocket');
            builder.can('launch', 'rocket', { ownerId: request.user.userId });
            builder.can('update', 'rocket', { ownerId: request.user.userId });
            builder.can('delete', 'rocket', { ownerId: request.user.userId });
            break;
        }
      }
    }
  }
}
