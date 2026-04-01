import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes">
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
  @Input() size: 'xs' | 'sm' = 'sm';

  get classes(): string {
    const base = 'inline-flex items-center font-semibold rounded-full px-2.5 py-0.5 leading-tight';
    
    const variants = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      neutral: 'bg-slate-100 text-slate-800'
    };

    const sizes = {
      xs: 'text-[10px] px-2 py-0.5',
      sm: 'text-xs px-2.5 py-0.5'
    };

    return `${base} ${variants[this.variant]} ${sizes[this.size]}`;
  }
}
