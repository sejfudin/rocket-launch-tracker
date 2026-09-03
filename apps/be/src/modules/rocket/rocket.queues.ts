import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { EmailService } from '~common/email';
import { LoggerService } from '~common/logger';
import { PushNotificationService } from '~common/push-notifications';
import { type IQueueJob, RegisterProcessor } from '~common/queues';

import { RocketLaunchResultEmailTemplate } from '~modules/rocket/rocket.email-templates';
import { RocketLaunchResultTemplate } from '~modules/rocket/rocket.push-notification.service';
import { UserService } from '~modules/users/user/user.service';

import { RocketStatusType } from './models';
import { RocketService } from './rocket.service';
import { RocketProvider } from './rocket-provider.abstract';

export class RocketLaunchJobData {
  /**
   * Rocket ID
   */
  @Expose()
  @IsString()
  readonly rocketId!: string;

  /**
   * Launch Director ID - the user to notify about launch result
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly launchDirectorId?: string;
}

export class RocketStatusJobData {
  @Expose()
  @IsEnum(RocketStatusType)
  readonly status!: RocketStatusType;
}

@Injectable()
export class RocketQueues {
  constructor(
    private readonly logger: LoggerService,
    private readonly rocketService: RocketService,
    private readonly rocketProvider: RocketProvider,
    private readonly pushNotificationService: PushNotificationService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  @RegisterProcessor('rocket:launch', {
    validate: RocketLaunchJobData,
  })
  async launchProcessor(job: IQueueJob<RocketLaunchJobData>): Promise<{ message: string; status: RocketStatusType }> {
    const rocketId = job.payload!.rocketId;
    const launchDirectorId = job.payload!.launchDirectorId;
    const rocket = await this.rocketService.find({ id: rocketId });
    if (!rocket) {
      return { message: `Rocket ${rocketId} not found`, status: RocketStatusType.Unknown };
    }

    try {
      const updatedRocket = await this.rocketProvider.launch(rocket);

      // Send notification and email to launch director
      if (launchDirectorId) {
        await this.sendLaunchResultNotifications(launchDirectorId, updatedRocket.name, updatedRocket.status);
      }

      return {
        message: `Rocket ${rocketId} ${updatedRocket.status}`,
        status: updatedRocket.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Rocket ${rocketId} launch failed`, { rocketId }, error);
      return {
        message: `Rocket ${rocketId} launch failed: ${errorMessage}`,
        status: RocketStatusType.Unknown,
      };
    }
  }

  private async sendLaunchResultNotifications(
    launchDirectorId: string,
    rocketName: string,
    status: RocketStatusType,
  ): Promise<void> {
    const isSuccess = status === RocketStatusType.InFlight;
    const result = isSuccess ? 'is in flight' : 'has exploded';
    const message = isSuccess
      ? 'Your rocket launched successfully and is now in flight.'
      : 'Unfortunately, your rocket experienced a failure during launch. You can attempt to relaunch.';

    // Send push notification
    await this.pushNotificationService.sendTemplate(
      { resourceName: launchDirectorId },
      RocketLaunchResultTemplate.name,
      {
        name: rocketName,
        result,
      },
    );

    // Get user email for email notification
    const user = await this.userService.find({ id: launchDirectorId });
    if (user?.email) {
      await this.emailService.sendTemplate({ to: user.email }, RocketLaunchResultEmailTemplate.name, {
        name: rocketName,
        result,
        message,
      });
    }
  }

  @RegisterProcessor('rocket:status', {
    validate: RocketStatusJobData,
    timeout: 10,
    cronJobs: [
      {
        // once an hour
        cron: '0 * * * *',
        processor: 'rocket:status',
        payload: {
          status: RocketStatusType.Ready,
        } satisfies RocketStatusJobData,
      },
    ],
  })
  async statusCronProcessor(
    job: IQueueJob<RocketStatusJobData>,
  ): Promise<{ message: string; status: RocketStatusType }> {
    const rockets = await this.rocketService.paginate({
      limit: 10,
      filter: {
        status: job.payload!.status,
      },
    });
    this.logger.log(`${rockets.totalItems} rockets ready to launch`, { status: job.payload!.status });
    return { message: `${rockets.totalItems} rockets ready to launch`, status: RocketStatusType.InFlight };
  }
}
