export const USER_AUTHN_KEY = 'user';
export const USER_AUTHN_JWT_SERVICE = Symbol('USER_AUTHN_JWT_SERVICE');
export const USER_AUTH_REST_PREFIX = 'user/auth';
export const USER_AUTH_JWT_AUDIENCE = `${USER_AUTHN_KEY}:at`;
export const USER_AUTH_JWT_REFRESH_AUDIENCE = `${USER_AUTHN_KEY}:rt`;

export const USER_AUTH_API_TAG = 'User Auth';
