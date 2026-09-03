export interface IPushNotificationToken {
  id: string;
  resourceName: string;
  resourceLabel?: string;
  token: string;
  title?: string;
  provider: string;
  module?: string;
  resourceId?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface IPushNotificationTokenCreate {
  id?: string;
  resourceName: string;
  resourceLabel?: string;
  token: string;
  title?: string;
  provider: string;
  module?: string;
  resourceId?: string;
  expiresAt?: Date;
}
