import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutesAgo',
  standalone: false,
})
export class MinutesAgoPipe implements PipeTransform {

  transform(value: any): string {
    if (!value) {
      return '';
    }

    const now = new Date();
    const then = new Date(value);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute(s) ago`;
    } else if (diffMins < 1440) {
      return `${Math.round(diffMins / 60)} hour(s) ago`;
    } else {
      return `${Math.round(diffMins / 1440)} day(s) ago`;
    }
  }
}
