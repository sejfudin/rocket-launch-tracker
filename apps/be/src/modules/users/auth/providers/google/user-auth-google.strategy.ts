import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { IAuthnRequestUser } from '~common/authn';
import { CoreConfig } from '~common/core';

import { USER_AUTHN_KEY, USER_AUTH_REST_PREFIX } from '~modules/users/auth';
import { USER_AUTHN_GOOGLE_STRATEGY } from '~modules/users/auth/providers/google/user-auth-google.constants';

import { UserAuthGoogleConfig } from './user-auth-google.config';

@Injectable()
export class UserAuthGoogleStrategy extends PassportStrategy(Strategy, USER_AUTHN_GOOGLE_STRATEGY) {
  constructor(
    private readonly userAuthGoogleConfig: UserAuthGoogleConfig,
    private readonly coreConfig: CoreConfig,
  ) {
    let callbackURL =
      userAuthGoogleConfig.callbackURL ?? `${coreConfig.apiBaseUrl}/api/${USER_AUTH_REST_PREFIX}/google/callback`;
    if (callbackURL.startsWith('/')) {
      callbackURL = coreConfig.apiBaseUrl + callbackURL;
    }
    super(
      userAuthGoogleConfig.enabled
        ? {
            clientID: userAuthGoogleConfig.clientID,
            clientSecret: userAuthGoogleConfig.clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
            passReqToCallback: false, // the first param in 'validate' will be request
          }
        : {
            clientID: 'disabled',
            clientSecret: 'disabled',
            callbackURL: 'disabled',
            passReqToCallback: false, // the first param in 'validate' will be request
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
      provider: 'google',
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

      ident: `google:${profile.id}`,
    };
  }
}
