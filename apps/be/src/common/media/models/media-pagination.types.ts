import { IDateRange } from '~common/http/interfaces/date-range.interface';
import { IPaginationQuery } from '~common/http/pagination/pagination.types';

export interface IMediaFileSizeRange {
  minSize?: number;
  maxSize?: number;
}

export interface IMediaFilter {
  ids?: string[];
  module?: string;
  type?: string;
  search?: string;
  fileSizeRanges?: IMediaFileSizeRange[];
  userId?: string; // Filter by user who uploaded the file
  createdAt?: IDateRange;
  mimeTypes?: string[]; // Multiple MIME types filter
  uploaded?: boolean;
  validated?: boolean;
}

export enum MediaOrderField {
  id = 'id',
  fileName = 'fileName',
  fileSize = 'fileSize',
  userId = 'userId',
  createdAt = 'createdAt',
  mimeType = 'mimeType',
}

export interface IMediaPaginationQuery extends IPaginationQuery<IMediaFilter, MediaOrderField> {}
