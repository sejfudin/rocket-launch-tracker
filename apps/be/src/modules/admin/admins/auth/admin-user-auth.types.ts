import { type IAuthnRequestIdentity } from '~common/authn';

export interface IAdminUserAuthRequestUser extends IAuthnRequestIdentity {
  roles?: string[];
}
