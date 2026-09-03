import { createScaffolding } from '@povio/scaffold';
import { z } from '@povio/scaffold/plugins/zod';

export default createScaffolding({
  name: '~common/media/providers/aws-s3',

  configSchema: z.object({
    mode: z.enum(['disabled', 'enabled']).default('disabled'),
    localstack: z.boolean().default(false),
  }),

  async init({ config }, { setStatus, addRequest }) {
    const enabled = config!.mode !== 'disabled';

    await addRequest({
      match: 'tsconfig:exclude',
      value: { path: 'src/common/media/providers/aws-s3', excluded: !enabled, context: '[all]' },
    });

    if (!enabled) {
      setStatus('disabled');
      return;
    }

    /*
    await addRequest({
      match: 'nest-module:activate',
      description: 'activate media module',
      value: {
        module: 'AppModule',
        fileImports: [
          ['EmailModule', '~common/media'],
          ['AwsSesEmailModule', '~common/media/providers/aws-ses'],
        ],
        // todo, deep injecting
        imports: [`EmailModule.forRoot([AwsSesEmailModule]),`],
      },
    });
    */

    if (config!.localstack) {
      await addRequest({
        match: 'dot-config:configure',
        value: {
          stage: 'local',
          state: 'created',
          value: {
            'media.defaultProvider': 'aws-s3',
            'media.awsS3.bucket': 'media',
            'media.awsS3.apiEndpoint': 'http://localhost:4566',
            'media.awsS3.accessKeyId': 'random-key',
            'media.awsS3.secretAccessKey': 'random-secret',
            'media.awsS3.region': 'us-east-1',
            'media.awsS3.prefix': 'uploads/',
          },
        },
      });

      await addRequest({
        match: 'docker-compose:configure',
        description: 'localstack docker-compose service',
        value: {
          state: 'created',
          value: {
            'services.localstack': {
              image: 'localstack/localstack:4.2.0',
              environment: [
                // 'DEBUG=1',
                'DOCKER_HOST=unix:///var/run/docker.sock',
                'LOCALSTACK_HOST=localhost',
                'SERVICES=s3,ses',
                'LS_LOG=trace',
              ],
              volumes: [
                '.tmp/localstack:/var/lib/localstack',
                './scripts/localstack-init.d/:/etc/localstack/init/ready.d/',
                '/var/run/docker.sock:/var/run/docker.sock',
              ],
              entrypoint:
                'bash -c "mkdir -p /tmp/localstack && chmod 777 -R /tmp/localstack && /usr/local/bin/docker-entrypoint.sh"',
              ports: ['4566:4566', '4510-4559:4510-4559'],
            },
          },
        },
      });

      await addRequest({
        match: 'scripts:set',
        description: 'inject localstack bucket creation script',
        value: {
          module: 'localstack-init.d',
          state: 'created',
          name: 'init-upload-bucket.sh',
          value:
            // language=sh
            `#!/bin/bash
  
  awslocal s3 mb s3://media
  awslocal s3api put-bucket-cors --bucket media --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'`,
        },
      });
    }

    await addRequest({
      match: 'dot-config:configure',
      value: {
        stage: '[deployed]',
        state: 'created',
        value: {
          'media.defaultProvider': 'aws-s3',
          'media.awsS3.bucket': '${env:MEDIA_BUCKET}',
          'media.awsS3.prefix': 'uploads/',
          'media.awsS3.publicUrl': '${env:MEDIA_PUBLIC_URL}',
        },
      },
    });

    for (const pkg of [
      '@aws-sdk/client-s3@^3.964.0',
      '@aws-sdk/cloudfront-signer@^3.957.0',
      '@aws-sdk/s3-presigned-post@^3.964.0',
      '@aws-sdk/s3-request-presigner@^3.964.0',
      'file-type@^21.3.0',
      '@tokenizer/s3@^1.0.1',
      'mime-types@^3.0.2',
    ]) {
      await addRequest({
        match: 'package.json:dependency',
        value: { pkg },
      });
    }

    await addRequest({
      match: 'package.json:dependency',
      value: { pkg: '@types/mime-types', dev: true },
    });
  },
});
