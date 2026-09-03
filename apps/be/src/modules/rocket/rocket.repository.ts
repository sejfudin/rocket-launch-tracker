import { Injectable } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import { IRocket, IRocketCreate, IRocketLabelsRequest, IRocketPaginationQuery, IRocketUpdate } from './models';

@Injectable()
export abstract class RocketRepository {
  abstract paginate(query: IRocketPaginationQuery, _tx?: Transaction): Promise<IPagination<IRocket>>;
  abstract find(where: { id: string; ownerId?: string }, _tx?: Transaction): Promise<IRocket | null>;
  abstract findNextLaunch(_tx?: Transaction): Promise<IRocket | null>;
  abstract create(data: IRocketCreate, _tx?: Transaction): Promise<IRocket>;
  abstract update(where: { id: string; ownerId?: string }, data: IRocketUpdate, _tx?: Transaction): Promise<IRocket>;
  abstract delete(where: { id: string; ownerId?: string }, _tx?: Transaction): Promise<void>;
  abstract listLabels(query: IRocketLabelsRequest, _tx?: Transaction): Promise<{ id: string; label: string }[]>;
  abstract withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
