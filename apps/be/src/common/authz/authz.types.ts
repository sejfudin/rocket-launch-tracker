export interface IAuthzPermission {
  subject: string;
  action: string;
  /**
   * {
   *   // dot-notation path to a variable
   *   myId: '$get.myId'
   *   // static value
   *   myStatic: 'myValue'
   * }
   */
  conditions?: Record<string, string>;
}

export interface IAuthzRule {
  id: string;

  subject: string;
  action: string;
  conditions?: Record<string, string>;

  ownerId?: string;
  ownerType?: string;

  targetId: string;
  targetType: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthzRuleCreate {
  subject: string;
  action: string;
  conditions?: Record<string, string>;

  ownerId?: string;
  ownerType?: string;

  targetId: string;
  targetType: string;
}

export interface IAuthzRuleUpdate {
  subject: string;
  action: string;
  conditions?: Record<string, string>;
}
