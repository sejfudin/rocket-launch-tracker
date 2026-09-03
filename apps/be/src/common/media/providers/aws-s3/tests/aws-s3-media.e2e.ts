import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe } from 'vitest';

import { getConfig } from '~common/config';
import { LoggerModule } from '~common/logger';
import { createMediaProviderTestSuite } from '~common/media/tests/media-provider.test-suite';

import { MediaModule } from '../../../media.module';
import { NotImplementedMediaPersistorPlugin } from '../../../persistors/not-implemented';
import { AwsS3MediaConfig } from '../aws-s3-media.config';
import { AwsS3MediaPlugin } from '../aws-s3-media.plugin';
import { AwsS3MediaProvider } from '../aws-s3-media.provider';

const awsS3MediaConfig = getConfig(AwsS3MediaConfig);

describe('AWS S3 MediaService', { skip: !awsS3MediaConfig.apiEndpoint }, () => {
  let app: INestApplication;
  let mediaProvider: AwsS3MediaProvider;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, MediaModule.forRoot([AwsS3MediaPlugin, NotImplementedMediaPersistorPlugin])],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    mediaProvider = app.get(AwsS3MediaProvider);
  });

  createMediaProviderTestSuite({
    provider: () => mediaProvider,
    fetchOptions: {
      providerOptions: {
        signFetch: 's3',
        bucket: 'media',
      },
    },
    uploadOptions: {
      providerOptions: {
        bucket: 'media',
      },
    },
    supportedMethods: ['post', 'put'],
  });
});
