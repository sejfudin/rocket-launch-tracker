import { type Ability, type AbilityBuilder } from '@casl/ability';

import { type IAuthnIdentity } from '~common/authn';

export type AppAbility = Ability;

/**
 * Authz Provider Service
 */
export abstract class AuthzProvider {
  /**
   * Get user details from the authn provider
   */
  public abstract applyRules(request: { user: IAuthnIdentity }, builder: AbilityBuilder<AppAbility>): Promise<void>;
}
