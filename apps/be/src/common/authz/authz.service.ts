import { AbilityBuilder, ConditionsMatcher, PureAbility, subject } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { IAuthnIdentity } from '~common/authn';

import { AuthzLoader } from './authz.loader';
import { IAuthzPermission } from './authz.types';
import { AppAbility } from './authz-provider.abstract';

// simple conditions check, all props have to match
const conditionsMatcher: ConditionsMatcher<Record<string, unknown>> = (conditions) => {
  return (object) => {
    return Object.entries(conditions).every(([k, v]) => k in object && object[k] === v);
  };
};

@Injectable()
export class AuthzService {
  constructor(private readonly authzLoader: AuthzLoader) {}

  async generateAbilities(request: { user: IAuthnIdentity }): Promise<AppAbility> {
    const builder = new AbilityBuilder<AppAbility>(PureAbility);

    for (const provider of Object.values(this.authzLoader.providers)) {
      await provider.applyRules(request, builder);
    }

    return builder.build({ conditionsMatcher });
  }

  /**
   * Check if we have any of the given permissions
   */
  async checkPermissions(permissions: IAuthzPermission[], ability: AppAbility): Promise<boolean> {
    for (const perm of permissions) {
      if (ability.can(perm.action, subject(perm.subject, perm.conditions || {}))) {
        return true;
      }
    }
    return false;
  }
}
