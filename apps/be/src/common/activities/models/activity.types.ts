import { JsonObject } from '~common/types';

export interface IActivity {
  id: string;

  timestamp: Date;
  payload: JsonObject;
  metadata?: JsonObject;

  module: string;
  type: string;
  userId?: string;
  resourceId?: string;
}

export interface IActivityCreate {
  id?: string;
  module: string;
  type: string;
  timestamp?: Date;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  userId?: string;
  resourceId?: string;
}
