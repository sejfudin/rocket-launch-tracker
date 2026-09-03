# AWS S3 Provider

## Direct Uploads

Uploading to S3 is done directly from the client to s3 using presigned urls. If credentials are invalid,
the process will only error out when an upload is attempted.

## Direct Downloads

There are several ways to download the file:

- Cloudfront relay from the API url to the s3 bucket, ie api.myapp.com/uploads is the default ( for high volume, public files )
- Cloudfront relay plus signed cookie ( for high volume, but protected media )
- Pre-signed S3 download ( for low volume, big files and semi-protected media )
- Direct S3 Link ( should be avoided since we can not cache the response nor protect it)
- Custom relay via the backend ( potentially gives the maximum protection, but data is sent via backend )

Never expose the key to the client. While not strictly a security concern, it breaks the abstraction layer. Use generated url's instead. Eq:

```typescript
const { url } = await this.mediaService.createMediaFetchRequest({ id: entity.pictureId });
```

## Local testing

Local testing can be done using localstack:

```yaml
localstack:
  image: localstack/localstack:4.2.0
  environment:
    - DOCKER_HOST=unix:///var/run/docker.sock
    - LOCALSTACK_HOST=localhost
    - SERVICES=s3,ses
    - LS_LOG=trace
  volumes:
    - .tmp/localstack:/var/lib/localstack
    - ./scripts/localstack-init.d/:/etc/localstack/init/ready.d/
    - /var/run/docker.sock:/var/run/docker.sock
  entrypoint: bash -c "mkdir -p /tmp/localstack && chmod 777 -R /tmp/localstack &&
    /usr/local/bin/docker-entrypoint.sh"
  ports:
    - 4566:4566
    - 4510-4559:4510-4559
```

Testing configuration:

```yaml
media:
  awsS3:
    bucket: media
    region: us-east-1
    enabled: true
    accessKeyId: random-key
    secretAccessKey: random-key
    apiEndpoint: http://localhost:4566
```
