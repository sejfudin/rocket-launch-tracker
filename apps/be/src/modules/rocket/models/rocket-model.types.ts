import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export interface IRocketModel {
  id: string;
  name: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRocketModelCreate {
  id?: string;
  name: string;
  organization?: string;
}

export interface IRocketModelUpdate {
  name?: string;
  organization?: string;
}

export class RocketModelListQueryDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;
}

export interface IRocketModelListQueryDto extends RocketModelListQueryDto {}
