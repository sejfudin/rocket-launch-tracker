import { type IMediaAttachRequest, type IMediaFetchInstructions } from '~common/media';

export enum RocketStatusType {
  Unknown = 'unknown',
  Ready = 'ready',
  Launching = 'launching',
  Exploded = 'exploded',
  InFlight = 'in-flight',
}

export enum RocketType {
  Commercial = 'commercial',
  SpaceExploration = 'space_exploration',
}

export interface IRocket {
  id: string;
  name: string;
  modelId?: string;
  model?: IRocketModel;

  // Assignment fields
  height?: number;
  weight?: number;
  launchDatetime?: Date;
  rocketType?: RocketType;
  passengers?: string[];
  crew?: string[];

  status: RocketStatusType;

  picture?: IMediaFetchInstructions;
  timelapses?: Array<IMediaFetchInstructions>;

  ownerId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IRocketCreate {
  id?: string;
  name: string;
  modelId?: string;

  // Assignment fields
  height?: number;
  weight?: number;
  launchDatetime?: Date;
  rocketType?: RocketType;
  passengers?: string[];
  crew?: string[];

  ownerId?: string;

  status?: RocketStatusType;
}

export interface IRocketUpdate {
  name?: string;
  modelId?: string;

  // Assignment fields
  height?: number;
  weight?: number;
  launchDatetime?: Date;
  rocketType?: RocketType;
  passengers?: string[];
  crew?: string[];

  picture?: IMediaAttachRequest;
  timelapses?: Array<IMediaAttachRequest>;

  ownerId?: string;

  status?: RocketStatusType;
}

export interface IRocketModel {
  id: string;
  name: string;
  organization?: string;
}
