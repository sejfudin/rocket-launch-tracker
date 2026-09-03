import { Injectable } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import { IRocketModelPaginationQuery } from './models/rocket-model.pagination.request';
import { IRocketModel, IRocketModelCreate, IRocketModelUpdate } from './models/rocket-model.types';

@Injectable()
export abstract class RocketModelRepository {
  abstract paginate(query: IRocketModelPaginationQuery, _tx?: Transaction): Promise<IPagination<IRocketModel>>;
  abstract find(where: { id: string }, _tx?: Transaction): Promise<IRocketModel | null>;
  abstract findByName(name: string, _tx?: Transaction): Promise<IRocketModel | null>;
  abstract create(data: IRocketModelCreate, _tx?: Transaction): Promise<IRocketModel>;
  abstract update(where: { id: string }, data: IRocketModelUpdate, _tx?: Transaction): Promise<IRocketModel>;
  abstract delete(where: { id: string }, _tx?: Transaction): Promise<void>;
  abstract withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
