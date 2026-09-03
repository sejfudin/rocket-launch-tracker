export enum SettingsSettingAction {
  Copy = 'copy',
  Edit = 'edit',
  Delete = 'delete',
}

export enum SettingsStatus {
  Ok = 'ok',
  Error = 'error',
  Warning = 'warning',
  Disabled = 'disabled',
}

export interface ISettingsItem {
  name: string;
  label?: string;
  value?: string;
  actions?: Array<SettingsSettingAction>;
}

export interface ISettingsSection {
  name: string;
  label?: string;
  status: SettingsStatus;
  statusMessage?: string;
  items?: Array<ISettingsItem>;
}

export interface ISettingsModule {
  name: string;
  label?: string;
  status: SettingsStatus;
  statusMessage?: string;
  items?: Array<ISettingsItem>;
  sections?: Array<ISettingsSection>;
}
