import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max } from 'class-validator';

export enum RocketLabelsField {
  ID = 'id',
  NAME = 'name',
  MODEL_ID = 'modelId',
  MODEL_NAME = 'modelName',
}

export enum RocketLabelsName {
  NAME = 'name',
  NAME_DETAILS = 'name-details',
}

export class RocketLabelsRequest {
  @Expose()
  @IsEnum(RocketLabelsField)
  @ApiProperty({ enum: RocketLabelsField, enumName: 'RocketLabelsField' })
  readonly field!: RocketLabelsField;

  @Expose()
  @IsEnum(RocketLabelsName)
  @ApiProperty({ enum: RocketLabelsName, enumName: 'RocketLabelsName' })
  readonly name!: RocketLabelsName;

  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @Max(100)
  @Type(() => Number)
  readonly limit?: number = 20;
}

export interface IRocketLabelsRequest extends RocketLabelsRequest {}
