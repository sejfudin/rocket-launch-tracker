export const ADMIN_USER_AUTHN_KEY = 'admin-user';
export const ADMIN_USER_AUTHN_JWT_SERVICE = Symbol('ADMIN_USER_AUTHN_JWT_SERVICE');
export const ADMIN_USER_AUTH_REST_PREFIX = 'admin-user/auth';
export const ADMIN_USER_AUTH_JWT_AUDIENCE = `${ADMIN_USER_AUTHN_KEY}:at`;
export const ADMIN_USER_AUTH_JWT_REFRESH_AUDIENCE = `${ADMIN_USER_AUTHN_KEY}:rt`;

export const ADMIN_USER_AUTH_API_TAG = 'AdminUser';
