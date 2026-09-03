import { type IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import type { IUser, IUserCreate, IUserPaginationFilter, IUserPaginationQuery, IUserUpdate } from './models';
import { IUserLabelsRequest } from './models/user-labels.request';

export abstract class UserRepository {
  abstract paginate(query: IUserPaginationQuery, tx?: Transaction): Promise<IPagination<IUser>>;

  abstract list(where: IUserPaginationFilter, tx?: Transaction): Promise<IUser[]>;

  abstract find(where: { id: string }, tx?: Transaction): Promise<IUser | null>;

  abstract create(data: IUserCreate, tx?: Transaction): Promise<IUser>;

  abstract update(where: { id: string }, data: IUserUpdate, tx?: Transaction): Promise<IUser>;

  abstract delete(where: { id: string }, tx?: Transaction): Promise<void>;

  abstract listLabels(query: IUserLabelsRequest, tx?: Transaction): Promise<{ id: string; label: string }[]>;
}
