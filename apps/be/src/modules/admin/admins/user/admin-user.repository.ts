import { type IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import type {
  IAdminUser,
  IAdminUserCreate,
  IAdminUserPaginationQuery,
  IAdminUserUpdate,
} from './models/admin-user.types';

export abstract class AdminUserRepository {
  abstract paginate(query: IAdminUserPaginationQuery, tx?: Transaction): Promise<IPagination<IAdminUser>>;

  abstract find(where: { id: string }, tx?: Transaction): Promise<IAdminUser | null>;

  abstract create(data: IAdminUserCreate, tx?: Transaction): Promise<IAdminUser>;

  abstract update(where: { id: string }, data: IAdminUserUpdate, tx?: Transaction): Promise<IAdminUser>;

  abstract delete(where: { id: string }, tx?: Transaction): Promise<void>;
}
