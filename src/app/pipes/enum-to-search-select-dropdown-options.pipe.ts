import {Pipe} from '@angular/core';
import {EnumToSearchSelectDropdownOptionsMapper} from '../mappers/enum-to-search-select-dropdown-options.mapper';

@Pipe({
  name: 'enumToSearchSelectDropdownOptions',
  standalone: false,
})
export class EnumToSearchSelectDropdownOptionsPipe {
  transform(value: any, ...args: any[]): any {
    return EnumToSearchSelectDropdownOptionsMapper.map(value);
  }
}
