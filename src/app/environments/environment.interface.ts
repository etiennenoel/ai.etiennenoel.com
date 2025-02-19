import {EnvironmentNameEnum} from '../enums/environment-name.enum';

export interface EnvironmentInterface {
  multimodal: boolean;

  name: EnvironmentNameEnum;
}
