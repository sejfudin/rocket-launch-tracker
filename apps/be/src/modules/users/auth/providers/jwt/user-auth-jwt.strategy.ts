import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthnIdentityService } from '~common/authn/identity';
import { UnauthorizedException } from '~common/exceptions';

import { UserAuthConfig } from '~modules/users/auth/user-auth.config';
import { IUserAuthRequestUser } from '~modules/users/auth/user-auth.types';
import { UserService } from '~modules/users/user/user.service';

import { USER_AUTHN_KEY, USER_AUTH_JWT_AUDIENCE } from '../../user-auth.constants';
import { USER_AUTHN_JWT_STRATEGY } from './user-auth-jwt.constants';

@Injectable()
export class UserAuthJwtStrategy extends PassportStrategy(Strategy, USER_AUTHN_JWT_STRATEGY) {
  constructor(
    private readonly userAuthConfig: UserAuthConfig,
    private readonly authnIdentityService: AuthnIdentityService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAuthConfig.secret,
      audience: USER_AUTH_JWT_AUDIENCE,
    });
  }

  async validate(token: { sub: string; uid: string; audience: string }): Promise<IUserAuthRequestUser> {
    const [authnIdentity, user] = await Promise.all([
      this.authnIdentityService.find({ id: token.sub }),
      this.userService.find({ id: token.uid }),
    ]).catch((e) => {
      throw new UnauthorizedException('User identity not found', { cause: e });
    });

    if (!authnIdentity) {
      throw new UnauthorizedException();
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
      namespace: USER_AUTHN_KEY,
      roles: user?.roles,
    };
  }
}
