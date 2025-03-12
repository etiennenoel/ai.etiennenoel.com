import {ItemInterface} from '@magieno/angular-bootstrap-dropdown';

export class EnumToMagienoDropdownItemsMapper {
  static map(enumType: any): ItemInterface[] {
    return Object.entries(enumType).map(([key, value]) => ({
      title: key,
      value: value
    } as ItemInterface));
  }
}
