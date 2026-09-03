import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

import { SettingsPopulate } from '~common/settings/settings-provider.abstract';
import { TransformInputToArray } from '~common/validate';

export class SettingsAdminFilterDto {
  @Expose()
  @IsArray()
  @IsOptional()
  @TransformInputToArray()
  @IsEnum(SettingsPopulate, { each: true })
  @ApiPropertyOptional({ enum: SettingsPopulate, isArray: true, enumName: 'SettingsPopulate' })
  @IsOptional()
  readonly populate?: SettingsPopulate[];
}
