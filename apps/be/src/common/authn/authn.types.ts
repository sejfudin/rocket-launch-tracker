import type { JsonObject, JsonValue } from '~common/types';

export interface IAuthnProviderIdentity {
  /** Identity provider, eq local, auth0 **/
  provider: string;
  /** Identity id, eq sub for auth0 **/
  providerId: string;
  /** Extra provider data **/
  providerData?: IAuthnProviderData;

  namespace: string;
}

/**
 * Resolved identity from the authn provider
 */
export interface IAuthnIdentity extends IAuthnProviderIdentity {
  /** Internal Identity ID */
  id: string;

  /**
   * The user id that this identity is associated with
   */
  userId: string;

  disabledAt?: Date;
  validatedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthnRequestIdentity extends Partial<IAuthnIdentity> {
  ident?: string;
}

/**
 * Normalized data from authn providers
 */
export interface IAuthnProviderData {
  name?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  emailVerified?: boolean;
  [key: string]: JsonValue | undefined;
}

export interface IAuthnIdentityCreate {
  id?: string;
  namespace: string;
  provider: string;
  providerId: string;
  providerData: IAuthnProviderData;
  userId: string;
  disabledAt?: Date;
  validatedAt?: Date;
}

export interface IAuthnIdentityUpdate {
  disabledAt?: Date;
  validatedAt?: Date;
  userId?: string;
  providerData?: IAuthnProviderData;
}

export interface IAuthnToken {
  accessToken: string;
  refreshToken?: string;
}

export interface IAuthnNonce {
  id: string;
  authId: string;
  type: string;
  hashedNonce: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt?: Date;
  usedAt?: Date;
  usedData?: JsonObject;
  attempts: number;
}

export interface IAuthnNonceCreate {
  id: string;
  authId: string;
  type: string;
  hashedNonce: string;
  expiresAt: Date;
  attempts: number;
}

export interface IAuthnNonceUpdate {
  usedAt?: Date;
  usedData?: JsonObject;
  attempts?: number;
}

export type IAuthnRequestUser = (IAuthnProviderIdentity | IAuthnIdentity) & {
  // used in logging
  ident: string;
};
