import {Pipe} from '@angular/core';
import {EnumToMagienoDropdownItemsMapper} from '../mappers/enum-to-magieno-dropdown-items.mapper';

@Pipe({
  name: 'enumToMagienoDropdownItems',
  standalone: false,
})
export class EnumToMagienoDropdownItemsPipe {
  transform(value: any, ...args: any[]): any {
    return EnumToMagienoDropdownItemsMapper.map(value);
  }
}
