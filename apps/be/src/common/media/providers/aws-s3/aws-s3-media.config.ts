import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';

import { ConfigDecorator } from '~common/config';
import { TransformInputToArray, TransformInputToBoolean } from '~common/validate';

class AwsS3ServerConfig {
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  enabled = false;

  @Expose()
  @IsString()
  @IsOptional()
  apiEndpoint?: string;

  @Expose()
  @IsString()
  @IsOptional()
  accessKeyId?: string;

  @Expose()
  @IsString()
  @IsOptional()
  secretAccessKey?: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o: AwsS3ServerConfig) => o.enabled)
  region!: string;
}

class AwsCloudfrontSignerConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  keyPairId!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  privateKey!: string;
}

@ConfigDecorator('media.awsS3')
export class AwsS3MediaConfig extends AwsS3ServerConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o: AwsS3MediaConfig) => o.enabled)
  bucket!: string;

  /**
   * Key generation prefix
   */
  @Expose()
  @IsString()
  @IsOptional()
  prefix?: string;

  /**
   * Upload methods
   */
  @Expose()
  @IsOptional()
  @IsString({ each: true })
  @TransformInputToArray()
  uploadMethods: string[] = ['post', 'put'];

  /**
   * Optional public url to prefix all media urls with
   *  - post/put requests still go via the bucket endpoint
   */
  @Expose()
  @IsString()
  @IsOptional()
  publicUrl?: string;

  /**
   * Sign the fetch requests
   */
  @Expose()
  @IsString()
  @IsOptional()
  signFetch?: 's3' | 'cloudfront' | 'none';

  /**
   * CloudFront Configuration
   */
  @Expose()
  @Type(() => AwsCloudfrontSignerConfig)
  @ValidateNested()
  @ValidateIf((o: AwsS3MediaConfig) => o.signFetch === 'cloudfront')
  cloudfrontSigner?: AwsCloudfrontSignerConfig;

  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  preventOverride = false;
}
