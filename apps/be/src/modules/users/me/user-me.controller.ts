import { packRules } from '@casl/ability/extra';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthnIdentity, IAuthnIdentity } from '~common/authn';
import { AuthzService } from '~common/authz';

import { UserCheck } from '~modules/users/auth';
import { USER_API_TAG, USER_REST_PREFIX } from '~modules/users/user/user.constants';
import { UserService } from '~modules/users/user/user.service';

import { UserMeResponse, UserMeUpdateRequest } from './models';
import { UserMeService } from './user-me.service';

@ApiTags(USER_API_TAG)
@Controller(USER_REST_PREFIX)
export class UserMeController {
  constructor(
    private readonly accountService: UserMeService,
    private readonly userService: UserService,
    private readonly authzService: AuthzService,
  ) {}

  /**
   * Get the requesting user
   */
  @UserCheck()
  @Get('me')
  async get(@AuthnIdentity() auth: IAuthnIdentity): Promise<UserMeResponse> {
    const user = await this.userService.find({ id: auth.userId });
    if (!user) {
      throw new Error('User not found');
    }

    const authzAbility = await this.authzService.generateAbilities({ user: auth });

    return UserMeResponse.fromDomain({
      ...user,
      aclRules: packRules(authzAbility.rules),
    });
  }

  /**
   * Update the requesting user
   */
  @UserCheck()
  @Put('me')
  async update(@AuthnIdentity() auth: IAuthnIdentity, @Body() body: UserMeUpdateRequest): Promise<UserMeResponse> {
    return await this.accountService.update({ id: auth.userId }, body);
  }
}
