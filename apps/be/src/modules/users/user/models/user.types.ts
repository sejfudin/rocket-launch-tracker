import { type UserRole } from '../user.constants';

export interface IUser {
  id: string;
  email?: string;
  name?: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  id?: string;
  email?: string;
  name?: string;
  roles: UserRole[];
}

export interface IUserUpdate {
  email?: string;
  name?: string;
  roles?: UserRole[];
}
