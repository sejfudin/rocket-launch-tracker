import { Injectable } from '@nestjs/common';

import { getConfig } from '~common/config';
import { LoggerService } from '~common/logger';

import { IRocket, RocketStatusType } from '~modules/rocket/models';
import { RocketService } from '~modules/rocket/rocket.service';

import { RocketConfig } from '../../rocket.config';
import { RocketProvider } from '../../rocket-provider.abstract';

@Injectable()
export class RocketDefaultProvider extends RocketProvider {
  private readonly config: RocketConfig;

  constructor(
    private readonly logger: LoggerService,
    private readonly rocketService: RocketService,
  ) {
    super();
    this.config = getConfig(RocketConfig);
  }

  private async setState(
    rocketId: string,
    status: RocketStatusType,
    seconds?: number,
  ): Promise<{ status: RocketStatusType; message: string }> {
    await this.rocketService.update({ id: rocketId }, { status });
    const message = `Rocket ${rocketId} ${status}`;
    this.logger.log(message, { rocketId, status });

    if (seconds && seconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.speedFactor * seconds * 1000));
    }
    return { status, message };
  }

  async launch(rocket: IRocket): Promise<IRocket> {
    if (rocket.status === RocketStatusType.Launching) {
      throw new Error(`Rocket ${rocket.id} already launching`);
    }

    let currentState: { status: RocketStatusType; message: string } = {
      status: rocket.status,
      message: `Rocket ${rocket.id} ${rocket.status}`,
    };

    try {
      currentState = await this.setState(rocket.id, RocketStatusType.Launching, 10);

      if (Math.random() < 0.25) {
        await this.setState(rocket.id, RocketStatusType.Exploded);
        return await this.rocketService.find({ id: rocket.id });
      }

      currentState = await this.setState(rocket.id, RocketStatusType.InFlight);

      return await this.rocketService.find({ id: rocket.id });
    } catch (error) {
      switch (currentState.status) {
        case RocketStatusType.Ready:
          await this.setState(rocket.id, RocketStatusType.Ready);
          break;
        default:
          this.logger.error(
            `Rocket ${rocket.id} failed at unknown status ${currentState.status}`,
            { rocketId: rocket.id, status: currentState.status },
            error,
          );
          await this.setState(rocket.id, RocketStatusType.Exploded);
      }
      throw error;
    }
  }
}
