import { IRocket } from '~modules/rocket/models';

export abstract class RocketProvider {
  abstract launch(rocket: IRocket): Promise<IRocket>;
}
