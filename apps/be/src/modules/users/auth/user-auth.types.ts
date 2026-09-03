import { type IAuthnRequestIdentity } from '~common/authn';

export interface IUserAuthRequestUser extends IAuthnRequestIdentity {
  roles?: string[];
}
