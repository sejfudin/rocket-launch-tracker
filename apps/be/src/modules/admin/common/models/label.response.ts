import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class LabelResponse {
  @Expose()
  @IsString()
  readonly id!: string;

  @Expose()
  @IsString()
  readonly label!: string;

  constructor(data: LabelResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: ILabelResponse) {
    return new LabelResponse(data);
  }
}

export interface ILabelResponse extends LabelResponse {}
