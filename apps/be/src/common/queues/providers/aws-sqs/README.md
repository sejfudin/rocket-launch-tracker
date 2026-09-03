# AWS SQS Queue Provider

This provider enables queue job processing using Amazon SQS (Simple Queue Service).

## How It Works

- Enqueue: Jobs are stored in the database first, then a message is sent to SQS with the job ID
- Workers: Workers continuously poll SQS queues using long polling
- Processing: When a message is received, the worker:
   - Fetches the job from the database
   - Updates job status to `RUNNING`
   - Executes the job processor
   - Updates job status to `COMPLETED` or `FAILED`
   - Deletes the message from SQS
- Notes:
  - Consider setting up Dead Letter Queues (DLQ) in production for failed messages
  - Visibility timeout should be set longer than the expected job execution time to prevent duplicate processing

## Setup Steps

```yarn add @aws-sdk/client-sqs```

### 1. Add LocalStack Service (for Local Development)

Add the LocalStack service to your `compose.yml` file:

```yaml
localstack:
  image: localstack/localstack:4.11
  environment:
    - DOCKER_HOST=unix:///var/run/docker.sock
    - LOCALSTACK_HOST=localhost
    - SERVICES=sqs
    - LS_LOG=trace
  ports:
    - 4566:4566
    - 4510-4559:4510-4559
  volumes:
    - .tmp/localstack:/var/lib/localstack
    - ./scripts/localstack-init.d/:/etc/localstack/init/ready.d/
    - /var/run/docker.sock:/var/run/docker.sock
```

### 2. Create Queue Initialization Script

Create a script to initialize queues when LocalStack starts. Create `scripts/localstack-init.d/init-queue.sh`:

```bash
#!/bin/sh

set -e

awslocal sqs create-queue --queue-name default
```

Make the script executable:

```bash
chmod +x scripts/localstack-init.d/init-queue.sh
```

### 3. Configure the Provider

Inject into QueueModule

```typescript
import { Module } from '@nestjs/common';
import { SqsQueuePlugin } from '~common/queues/providers/sqs';

@Module({
  imports: [QueueModule.forRoot([SqsQueuePlugin])],
})
export class AppModule {}
```

```yaml
queues:
  aws-sqs:
    enabled: true
    region: us-east-1
    endpoint: http://localhost:4566  # Localstack, only for development
    accessKeyId: random-key          # Optional, uses role
    secretAccessKey: random-secret   # Optional, uses role
    accountId: "000000000000"
    runWorkers: true
    workers:
      - queue: default
        maxNumberOfMessages: 1
        waitTimeSeconds: 20
        # visibilityTimeoutSeconds: 30
        # messageRetentionPeriodSeconds: 345600
```


