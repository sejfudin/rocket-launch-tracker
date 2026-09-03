import { mock } from 'node:test';

import { type AbilityBuilder } from '@casl/ability';

import type { IAuthnIdentity } from '~common/authn';

import { type AppAbility, AuthzProvider } from '../authz-provider.abstract';
import { type ProviderMock } from '~test/utils';

export const AuthzProviderMock: ProviderMock<AuthzProvider> = {
  provide: AuthzProvider,
  useValue: {
    applyRules: mock.fn(async (_request: { user: IAuthnIdentity }, _builder: AbilityBuilder<AppAbility>) => {
      return;
    }),
  } satisfies AuthzProvider,
};
