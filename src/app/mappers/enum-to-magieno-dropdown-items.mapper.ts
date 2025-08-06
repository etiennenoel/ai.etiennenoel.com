import {ItemInterface} from '@magieno/common';

export class EnumToMagienoDropdownItemsMapper {
  static map(enumType: any): ItemInterface[] {
    return Object.entries(enumType).map(([key, value]) => ({
      label: key,
      id: value
    } as ItemInterface));
  }
}
