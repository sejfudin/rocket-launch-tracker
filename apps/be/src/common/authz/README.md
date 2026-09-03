# Authorization

Generic authorization layer.

> Note: AclCheck requires request.user to be set up. This can be done with middleware or other Guards.

## Example Usage

```typescript
@Controller('rockets')
export class RocketManageController {
  /**
   *  The most basic usage is protecting requests - requesters need to
   *    have the correct permission that matches the resource.
   */
  @Get(':id')
  @AclCheck('rocket:read')
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<RocketResponse> {
    // user has full permissions to all rockets
    return this.rocketManageService.find({ id });
  }

  /**
   * Limiting permissions per object. Users could have a limited permission
   *    to only access some items. Users will full read permissions would avoid the `id` check.
   *   Example permission: rocket:read{id:'some-id'}
   *   Example request: /rockets/123524?color=red
   */
  @Get(':id')
  @AclCheck('rocket:read', { id: '$param.id' })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<RocketResponse> {
    return this.rocketManageService.find({ id });
  }

  /**
   * Limiting permissions per group. Users could have a limited permission
   *    to only access items with a certain attribute. In this case the service
   *    needs to make sure, that the requested ID matches the request.
   *   Example permission: rocket:read{color:'red'}
   *   Example request: /rockets/123524?color=red
   */
  @Get(':id')
  @AclCheck('rocket:read', { color: '$query.color' })
  async get(@Param('id', ParseUUIDPipe) id: string, @Query('color') color?: string): Promise<RocketResponse> {
    // forward the requested color, if any
    return this.rocketManageService.find({ id, color });
  }

  /**
   * Multiple permissions can be set - only one needs to match
   */
  @Get(':id')
  @AclCheck([['rocket:read'], ['rocket:read-more']])
  async get(@Param('id', ParseUUIDPipe) id: string, @Query('color') color?: string): Promise<RocketResponse> {
    return this.rocketManageService.find({ id });
  }

  /**
   * Custom permissions checks can be done but in most cases this is a code smell
   *  - this breaks the REST principle of simple, one task CRUD endpoints
   *  - it will not get reflected in OpenAPI
   *  - needs to be handled on the frontend manually
   *  - auditing and logging become complex
   */
  @Get(':id')
  @AclCheck()
  async get(@Param('id', ParseUUIDPipe) id: string, @AuthzAbility() abilities: PureAbility): Promise<RocketResponse> {
    if (
      // the full CASL query can be used here
      !abilities.can('read', 'rocket') ||
      !abilities.canNot('write', 'rocket')
    ) {
      throw new ForbiddenException();
    }
    return this.rocketManageService.find({ id, color });
  }
}
```

## Example Setup

Add the `AuthzModule` and plugins to `AppModule`.

```typescript
AuthzModule.forRoot([UserAuthzPlugin]);
```

Register your Authorization plugin. Rules are applied at request and can be based on the requesting user.

In this example, we derive the rules from the users' groups.

```typescript
import { Ability, AbilityBuilder } from '@casl/ability';
import { Injectable, ModuleMetadata, OnModuleInit } from '@nestjs/common';

import { IAuthnIdentity } from '~common/authn';
import { AuthzProvider } from '~common/authz/authz-provider.abstract';
import { AuthzLoader } from '~common/authz/authz.loader';

import { UserService } from '~modules/user/user.service';

@Injectable()
export class UserAuthz implements AuthzProvider, OnModuleInit {
  constructor(
    private userService: UserService,
    private readonly authzLoader: AuthzLoader,
  ) {}

  onModuleInit() {
    this.authzLoader.registerProvider('user', this);
  }

  async applyRules(request: { auth: IAuthnIdentity }, builder: AbilityBuilder<Ability>): Promise<void> {
    if (request.user.namespace === 'user') {
      // all users have access to their own account
      builder.can('manage', 'account');

      const user = await this.userService.find({ id: request.auth.userId });
      if (!user) throw new Error('User not found');
      for (const role of user.roles || []) {
        switch (role) {
          case 'STAFF':
            // 'manage' is a catch-all, it will allow all actions
            builder.can('manage', 'rocket');
        }
      }
    }
  }
}

export const UserAuthzPlugin: ModuleMetadata = {
  providers: [UserAuthz, UserService],
  exports: [UserAuthz],
};
```
