import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max } from 'class-validator';

export enum UserLabelsField {
  EMAIL = 'email',
  ID = 'id',
}

export enum UserLabelsName {
  EMAIL = 'email',
  NAME = 'name',
  NAME_EMAIL = 'name-email',
}

export class UserLabelsRequest {
  @Expose()
  @IsEnum(UserLabelsField)
  @ApiProperty({ enum: UserLabelsField, enumName: 'UserLabelsField' })
  readonly field!: UserLabelsField;

  @Expose()
  @IsEnum(UserLabelsName)
  @ApiProperty({ enum: UserLabelsName, enumName: 'UserLabelsName' })
  readonly name!: UserLabelsName;

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

export interface IUserLabelsRequest extends UserLabelsRequest {}
