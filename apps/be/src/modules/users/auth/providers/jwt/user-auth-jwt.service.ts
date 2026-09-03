import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IAuthnRequestIdentity } from '~common/authn';
import { IAuthnToken } from '~common/authn/tokens';

import { UserAuthConfig } from '../../user-auth.config';
import {
  USER_AUTHN_JWT_SERVICE,
  USER_AUTH_JWT_AUDIENCE,
  USER_AUTH_JWT_REFRESH_AUDIENCE,
} from '../../user-auth.constants';

@Injectable()
export class UserAuthJwtService {
  constructor(
    private readonly userAuthConfig: UserAuthConfig,

    @Inject(USER_AUTHN_JWT_SERVICE)
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
          audience: USER_AUTH_JWT_AUDIENCE,
          expiresIn: this.userAuthConfig.accessTokenExpiration,
        },
      ),
      refreshToken: this.userAuthConfig.refreshToken
        ? this.jwtService.sign(
            {
              sub: authn.id,
              uid: authn.userId,
            },
            {
              audience: USER_AUTH_JWT_REFRESH_AUDIENCE,
              expiresIn: this.userAuthConfig.refreshTokenExpiration,
            },
          )
        : undefined,
    };
  }

  refresh(refreshToken: string): IAuthnToken {
    const { sub, uid } = this.jwtService.verify(refreshToken, {
      audience: USER_AUTH_JWT_REFRESH_AUDIENCE,
    }) as unknown as { sub: string; uid: string };

    return {
      accessToken: this.jwtService.sign(
        {
          sub,
          uid,
        },
        {
          audience: USER_AUTH_JWT_AUDIENCE,
          expiresIn: this.userAuthConfig.accessTokenExpiration,
        },
      ),
      refreshToken: this.userAuthConfig.refreshTokenExtension
        ? this.jwtService.sign(
            {
              sub,
              uid,
            },
            {
              audience: USER_AUTH_JWT_REFRESH_AUDIENCE,
              expiresIn: this.userAuthConfig.refreshTokenExpiration,
            },
          )
        : undefined,
    };
  }
}
