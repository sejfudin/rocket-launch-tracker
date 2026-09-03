import { type IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import {
  type IMedia,
  type IMediaCreate,
  type IMediaId,
  type IMediaPaginationQuery,
  type IMediaResourceName,
} from './models';
import { MediaLabelsRequest } from './models/media-labels.request';

export abstract class MediaPersistor {
  public abstract find(where: { id: IMediaId } | { key: string }, _tx?: Transaction): Promise<IMedia | null>;
  public abstract list(
    options: {
      where: {
        id?: IMediaId | IMediaId[];
        key?: string | string[];
        resourceName?: IMediaResourceName;
        module?: string;
        type?: string;
        resourceId?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        uploaded?: boolean;
        validated?: boolean;
        deleted?: boolean;
        provider?: string;
        userId?: string;
      };
      skip?: number;
      take?: number;
    },
    _tx?: Transaction,
  ): Promise<IMedia[]>;
  public abstract count?(
    where?: {
      type?: string | string[];
      module?: string | string[];
      mimeType?: string | string[];
      userId?: string | string[];
      provider?: string | string[];
      resourceName?: string | string[];
    },
    options?: { groupBy?: 'type' | 'module' | 'provider' | 'userId' | 'mimeType' | 'resourceName' },
    _tx?: Transaction,
  ): Promise<Record<string, number> & { total?: number }>;
  public abstract create(data: IMediaCreate, _tx?: Transaction): Promise<IMedia>;
  public abstract update(
    where: { id: IMediaId } | { key: string },
    data: Partial<IMedia>,
    _tx?: Transaction,
  ): Promise<IMedia>;
  public abstract paginate(query: IMediaPaginationQuery, _tx?: Transaction): Promise<IPagination<IMedia>>;
  public abstract delete(where: { id: IMediaId }, _tx?: Transaction): Promise<void>;
  public abstract markForDeletion(where: { id: IMediaId }, _tx?: Transaction): Promise<IMedia | null>;
  public abstract listLabels(
    query: MediaLabelsRequest,
    _tx?: Transaction,
  ): Promise<Array<{ id: string; label: string }>>;
}
