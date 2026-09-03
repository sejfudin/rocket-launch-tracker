import { type ModuleMetadata } from '@nestjs/common';

import { getConfig, getConfigFactory } from '~common/config';

import { AwsS3MediaValidationWebhookConfig } from './aws-s3-media-webhook.config';
import { AwsS3MediaWebhookController } from './aws-s3-media-webhook.controller';

const config = getConfig(AwsS3MediaValidationWebhookConfig);

export const AwsS3MediaWebhookPlugin: ModuleMetadata = {
  providers: [getConfigFactory(AwsS3MediaValidationWebhookConfig)],
  controllers: config.enabled && config.secret ? [AwsS3MediaWebhookController] : [],
};
