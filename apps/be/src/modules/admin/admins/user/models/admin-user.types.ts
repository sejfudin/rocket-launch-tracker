import { type IDateRange } from '~common/http/interfaces/date-range.interface';
import { type IPaginationQuery } from '~common/http/pagination';

export interface IAdminUser {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminUserCreate {
  id?: string;
  email?: string;
  name?: string;
  roles: string[];
}

export interface IAdminUserUpdate {
  email?: string;
  name?: string;
  roles?: string[];
}

export interface IAdminUserPaginationFilter {
  ids?: string[];
  email?: string;
  name?: string;
  search?: string;
  createdAt?: IDateRange;
}

export enum AdminUserPaginationOrderField {
  name = 'name',
  email = 'email',
  createdAt = 'createdAt',
}

export interface IAdminUserPaginationQuery
  extends IPaginationQuery<IAdminUserPaginationFilter, AdminUserPaginationOrderField> {}
