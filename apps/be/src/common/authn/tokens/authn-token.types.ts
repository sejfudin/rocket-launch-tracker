import type { JsonValue } from '~common/types';

export interface IAuthnToken {
  accessToken: string;
  refreshToken?: string;
}

export interface IAuthnJWTToken {
  // created at
  iat: number;
  // expires at
  exp: number;
  // audience
  aud: string;
  // user id
  uid?: string;
  [key: string]: JsonValue | undefined;
}
