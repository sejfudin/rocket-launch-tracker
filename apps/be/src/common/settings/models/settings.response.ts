import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import {
  ISettingsItem,
  ISettingsModule,
  ISettingsSection,
  SettingsSettingAction,
  SettingsStatus,
} from './settings.types';

export class SettingsSectionItemResponse {
  @Expose()
  @IsString()
  readonly name!: string;

  @Expose()
  @IsString()
  readonly label?: string;

  @Expose()
  @IsOptional()
  readonly value?: string;

  @Expose()
  @IsEnum(SettingsSettingAction, { each: true })
  @ApiProperty({ enum: SettingsSettingAction, enumName: 'SettingsSettingAction' })
  @IsOptional()
  readonly actions?: Array<SettingsSettingAction>;

  constructor(data: Partial<SettingsSectionItemResponse>) {
    Object.assign(this, data);
  }

  static fromDomain(data: ISettingsItem): SettingsSectionItemResponse {
    return new SettingsSectionItemResponse(data);
  }
}

export class SettingsSectionResponse {
  @Expose()
  @IsString()
  readonly name!: string;

  @Expose()
  @IsString()
  readonly label?: string;

  @Expose()
  @IsEnum(SettingsStatus)
  @ApiProperty({ enum: SettingsStatus, enumName: 'SettingsStatus' })
  readonly status!: SettingsStatus;

  @Expose()
  @IsString()
  @IsOptional()
  readonly statusMessage?: string;

  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  readonly items?: Array<SettingsSectionItemResponse>;

  constructor(data: SettingsSectionResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: ISettingsSection): SettingsSectionResponse {
    return new SettingsSectionResponse({
      name: data.name,
      label: data.label,
      status: data.status,
      statusMessage: data.statusMessage,
      items: data.items?.map((x) => SettingsSectionItemResponse.fromDomain(x)),
    });
  }
}

export class SettingsModuleResponse {
  @Expose()
  @IsString()
  readonly name!: string;

  @Expose()
  @IsString()
  readonly label?: string;

  @Expose()
  @IsEnum(SettingsStatus)
  @ApiProperty({ enum: SettingsStatus, enumName: 'SettingsStatus' })
  readonly status!: SettingsStatus;

  @Expose()
  @IsString()
  @IsOptional()
  readonly statusMessage?: string;

  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  readonly items?: Array<SettingsSectionItemResponse>;

  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  readonly sections?: Array<SettingsSectionResponse>;

  constructor(data: SettingsModuleResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: ISettingsModule): SettingsModuleResponse {
    return new SettingsModuleResponse({
      name: data.name,
      label: data.label,
      status: data.status,
      statusMessage: data.statusMessage,
      items: data.items?.map((x) => SettingsSectionItemResponse.fromDomain(x)),
      sections: data.sections?.map((x) => SettingsSectionResponse.fromDomain(x)),
    });
  }
}
