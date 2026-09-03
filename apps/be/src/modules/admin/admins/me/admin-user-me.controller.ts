import { packRules } from '@casl/ability/extra';
import { Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthnIdentity, IAuthnIdentity } from '~common/authn';
import { AuthzService } from '~common/authz';

import { AuthenticatedAdminUser } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';

import { ADMIN_USER_API_TAG, ADMIN_USER_REST_PREFIX } from '../admin.constants';
import { AdminUserService } from '../user/admin-user.service';
import { AdminUserMeResponse } from './models/admin-user-me.response';

@ApiTags(ADMIN_USER_API_TAG)
@AdminController(ADMIN_USER_REST_PREFIX, { prefix: '' })
@AuthenticatedAdminUser()
export class AdminUserMeController {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly authzService: AuthzService,
  ) {}

  /**
   * Get the requesting user
   */
  @Get('me')
  async get(@AuthnIdentity() user: IAuthnIdentity): Promise<AdminUserMeResponse> {
    const admin = await this.adminUserService.find({ id: user.userId });
    if (!admin) {
      throw new Error('Admin not found');
    }

    const authzAbility = await this.authzService.generateAbilities({ user });

    return AdminUserMeResponse.fromDomain({
      ...admin,
      aclRules: packRules(authzAbility.rules),
    });
  }
}
