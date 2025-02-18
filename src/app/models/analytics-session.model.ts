import {ApiEnum} from '../enums/api.enum';
import {SatisfactionEnum} from '../enums/satisfaction.enum';

export class AnalyticsSessionModel {
  id = self.crypto.randomUUID();

  satisfaction?: SatisfactionEnum;

  comments?: string;

  sentToServer: boolean = false;

  constructor(
    public readonly api: ApiEnum,
    public parameters: any,
    public output: any,
  ) {
  }
}
