import { type ModuleMetadata } from '@nestjs/common';

import { getConfigFactory } from '~common/config';

import { AwsS3MediaConfig } from './aws-s3-media.config';
import { AwsS3MediaProvider } from './aws-s3-media.provider';

export const AwsS3MediaPlugin: ModuleMetadata = {
  providers: [getConfigFactory(AwsS3MediaConfig), AwsS3MediaProvider],
};
