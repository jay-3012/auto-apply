import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'atsColor',
  standalone: true
})
export class AtsScoreColorPipe implements PipeTransform {
  transform(score: number | null | undefined): string {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-700';
    if (score >= 75) return 'bg-emerald-100 text-emerald-700';
    if (score >= 55) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  }
}
