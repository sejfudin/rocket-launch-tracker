import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthnIdentityService } from '~common/authn/identity';
import { UnauthorizedException } from '~common/exceptions';

import { IAdminUserAuthRequestUser } from '~modules/admin/admins/auth/admin-user-auth.types';
import { AdminUserService } from '~modules/admin/admins/user/admin-user.service';

import { AdminUserAuthConfig } from '../../admin-user-auth.config';
import { ADMIN_USER_AUTHN_KEY, ADMIN_USER_AUTH_JWT_AUDIENCE } from '../../admin-user-auth.constants';
import { ADMIN_USER_AUTHN_JWT_STRATEGY } from './admin-user-auth-jwt.constants';

@Injectable()
export class AdminUserAuthJwtStrategy extends PassportStrategy(Strategy, ADMIN_USER_AUTHN_JWT_STRATEGY) {
  constructor(
    private readonly adminUserAuthConfig: AdminUserAuthConfig,
    private readonly adminUserService: AdminUserService,
    private readonly authnIdentityService: AuthnIdentityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: adminUserAuthConfig.secret,
      audience: ADMIN_USER_AUTH_JWT_AUDIENCE,
    });
  }

  async validate(token: { sub: string; uid: string; audience: string }): Promise<IAdminUserAuthRequestUser> {
    const [authnIdentity, user] = await Promise.all([
      this.authnIdentityService.find({ id: token.sub }),
      this.adminUserService.find({ id: token.uid }),
    ]).catch((e) => {
      throw new UnauthorizedException('User identity not found', { cause: e });
    });

    if (!authnIdentity) {
      throw new UnauthorizedException('User identity not found');
    }

    if (authnIdentity.disabledAt) {
      throw new UnauthorizedException('User is disabled');
    }

    if (authnIdentity?.userId !== token.uid) {
      throw new Error('Mismatched authnIdentity user');
    }

    return {
      id: token.sub,
      userId: token.uid,
      ident: `user:${token.uid}`,
      namespace: ADMIN_USER_AUTHN_KEY,
      roles: user?.roles,
    };
  }
}
