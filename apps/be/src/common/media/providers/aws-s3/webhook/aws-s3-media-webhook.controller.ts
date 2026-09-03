import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LoggerService } from '~common/logger';

import { MediaService } from '../../../media.service';
import { AwsS3MediaValidationWebhookConfig } from './aws-s3-media-webhook.config';
import type { AwsS3MediaWebhookValidateDto } from './dtos/aws-s3-media-webhook-validate.dto';

@ApiTags('Media')
@Controller('media/provider/s3/webhook')
export class AwsS3MediaWebhookController {
  constructor(
    private readonly config: AwsS3MediaValidationWebhookConfig,
    private readonly mediaService: MediaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Capture S3 media upload callback
   *  - call this endpoint from a lambda that listens to S3 events
   * @example
   *  fetch('https://api.example.com/media/provider/s3/webhook/validate', {
   *    method: 'POST',
   *    data: {
   *       key: 'uploads/small-image/1234.jpg',
   *    }
   *  });
   *  - always return 200 OK to prevent retries
   */
  @Post('validate')
  async validateWebhook(@Body() dto: AwsS3MediaWebhookValidateDto): Promise<void> {
    if (!this.config.enabled) {
      this.logger.error('Webhook not enabled');
      return;
    }
    if (!this.config.secret || dto.secret !== this.config.secret) {
      this.logger.error('Webhook secret mismatch');
      return;
    }
    try {
      const media = await this.mediaService.find({ key: dto.key });
      if (!media) {
        throw new NotFoundException('Media not found');
      }
      await this.mediaService.validate(media.id);
    } catch (error) {
      this.logger.error('Failed to validate media', error);
    }
  }
}
