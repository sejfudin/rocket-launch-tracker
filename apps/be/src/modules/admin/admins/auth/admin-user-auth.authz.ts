import { AbilityBuilder } from '@casl/ability';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { AuthzLoader } from '~common/authz/authz.loader';
import { AppAbility, AuthzProvider } from '~common/authz/authz-provider.abstract';

import { ADMIN_USER_AUTHN_KEY } from '~modules/admin/admins/auth/admin-user-auth.constants';
import { IAdminUserAuthRequestUser } from '~modules/admin/admins/auth/admin-user-auth.types';

import { AdminUserService } from '../user/admin-user.service';

@Injectable()
export class AdminUserAuthAuthz implements AuthzProvider, OnModuleInit {
  constructor(
    private adminUserService: AdminUserService,
    private readonly authzLoader: AuthzLoader,
  ) {}

  onModuleInit() {
    this.authzLoader.registerProvider(ADMIN_USER_AUTHN_KEY, this);
  }

  async applyRules(request: { user: IAdminUserAuthRequestUser }, builder: AbilityBuilder<AppAbility>): Promise<void> {
    if (request.user.namespace === ADMIN_USER_AUTHN_KEY) {
      for (const role of request.user.roles || []) {
        switch (role) {
          case 'general-manager':
            builder.can('manage', 'all');
            break;
          case 'activity-manager':
            builder.can('manage', 'activity');
            break;
          case 'admin-user-manager':
            builder.can('manage', 'adminUser');
            break;
          case 'user-manager':
            builder.can('manage', 'user');
            break;
          case 'email-manager':
            builder.can('manage', 'email');
            builder.can('manage', 'email-template');
            break;
          case 'media-manager':
            builder.can('manage', 'media');
            builder.can('manage', 'media-settings');
            break;
          case 'push-notification-manager':
            builder.can('manage', 'push-notification');
            builder.can('manage', 'push-notification-device');
            builder.can('manage', 'push-notification-template');
            break;
          case 'rocket-manager':
            builder.can('manage', 'rocket');
            break;
        }
      }
    }
  }
}
