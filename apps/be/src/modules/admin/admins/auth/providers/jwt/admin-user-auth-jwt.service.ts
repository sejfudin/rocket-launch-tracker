import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IAuthnRequestIdentity } from '~common/authn';
import { IAuthnToken } from '~common/authn/tokens';

import { AdminUserAuthConfig } from '../../admin-user-auth.config';
import {
  ADMIN_USER_AUTHN_JWT_SERVICE,
  ADMIN_USER_AUTH_JWT_AUDIENCE,
  ADMIN_USER_AUTH_JWT_REFRESH_AUDIENCE,
} from '../../admin-user-auth.constants';

@Injectable()
export class AdminUserAuthJwtService {
  constructor(
    private readonly adminUserAuthConfig: AdminUserAuthConfig,

    @Inject(ADMIN_USER_AUTHN_JWT_SERVICE)
    private readonly jwtService: JwtService,
  ) {}

  sign(authn: IAuthnRequestIdentity): IAuthnToken {
    return {
      accessToken: this.jwtService.sign(
        {
          sub: authn.id,
          uid: authn.userId,
        },
        {
          audience: ADMIN_USER_AUTH_JWT_AUDIENCE,
          expiresIn: this.adminUserAuthConfig.accessTokenExpiration,
        },
      ),
      refreshToken: this.adminUserAuthConfig.refreshToken
        ? this.jwtService.sign(
            {
              sub: authn.id,
              uid: authn.userId,
            },
            {
              audience: ADMIN_USER_AUTH_JWT_REFRESH_AUDIENCE,
              expiresIn: this.adminUserAuthConfig.refreshTokenExpiration,
            },
          )
        : undefined,
    };
  }

  refresh(refreshToken: string): IAuthnToken {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = this.jwtService.verify(refreshToken, { audience: ADMIN_USER_AUTH_JWT_REFRESH_AUDIENCE });
    const { sub, uid } = payload as { sub: string; uid: string };

    return {
      accessToken: this.jwtService.sign(
        {
          sub,
          uid,
        },
        {
          audience: ADMIN_USER_AUTH_JWT_AUDIENCE,
          expiresIn: this.adminUserAuthConfig.accessTokenExpiration,
        },
      ),
      refreshToken: this.adminUserAuthConfig.refreshTokenExtension
        ? this.jwtService.sign(
            {
              sub,
              uid,
            },
            {
              audience: ADMIN_USER_AUTH_JWT_REFRESH_AUDIENCE,
              expiresIn: this.adminUserAuthConfig.refreshTokenExpiration,
            },
          )
        : undefined,
    };
  }
}
