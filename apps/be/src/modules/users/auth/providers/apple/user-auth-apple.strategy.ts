import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';

import { IAuthnRequestUser } from '~common/authn';
import { CoreConfig } from '~common/core';

import { USER_AUTHN_KEY, USER_AUTH_REST_PREFIX } from '~modules/users/auth';

import { UserAuthAppleConfig } from './user-auth-apple.config';
import { USER_AUTHN_APPLE_STRATEGY } from './user-auth-apple.constants';

@Injectable()
export class UserAuthAppleStrategy extends PassportStrategy(Strategy, USER_AUTHN_APPLE_STRATEGY) {
  constructor(
    private readonly userAuthAppleConfig: UserAuthAppleConfig,
    private readonly coreConfig: CoreConfig,
  ) {
    let callbackURL =
      userAuthAppleConfig.callbackURL ?? `${coreConfig.apiBaseUrl}/api/${USER_AUTH_REST_PREFIX}/apple/callback`;
    if (callbackURL.startsWith('/')) {
      callbackURL = coreConfig.apiBaseUrl + callbackURL;
    }
    super(
      userAuthAppleConfig.enabled
        ? {
            clientID: userAuthAppleConfig.clientID,
            keyID: userAuthAppleConfig.keyID,
            teamID: userAuthAppleConfig.teamID,
            callbackURL: callbackURL,
            passReqToCallback: false, // the first param in 'validate' will be request
          }
        : {
            clientID: 'disabled',
            keyID: 'disabled',
            teamID: 'disabled',
            passReqToCallback: false, // the first param in '
          },
    );
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      name: {
        familyName: string;
        givenName: string;
      };
      emails: Array<{
        value: string;
        verified: boolean; // todo, should we honor this
      }>;
      photos: Array<{ value: string }>;
      provider: string;
    },
  ): Promise<IAuthnRequestUser> {
    return {
      provider: 'apple',
      providerId: profile.id,
      namespace: USER_AUTHN_KEY,

      providerData: {
        email: profile.emails[0].value,
        emailVerified: profile.emails[0].verified,
        name: profile.displayName,
        givenName: profile.name.givenName,
        familyName: profile.name.familyName,
        picture: profile.photos[0].value,
      },

      ident: `apple:${profile.id}`,
    };
  }
}
