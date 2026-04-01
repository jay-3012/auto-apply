import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <span *ngIf="dot" class="w-1.5 h-1.5 rounded-full mr-1.5" [class]="dotClasses"></span>
      <ng-content></ng-content>
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand' = 'neutral';
  @Input() size: 'xs' | 'sm' | 'md' = 'sm';
  @Input() rounded: 'full' | 'lg' = 'full';
  @Input() dot = false;

  get badgeClasses(): string {
    const base = 'inline-flex items-center font-semibold tracking-wide';
    
    const variants: Record<string, string> = {
      success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
      warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
      danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
      info: 'bg-sky-500/15 text-sky-400 border border-sky-500/20',
      neutral: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
      brand: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
    };

    const sizes: Record<string, string> = {
      xs: 'px-2 py-0.5 text-[10px]',
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm'
    };

    const rounded: Record<string, string> = {
      full: 'rounded-full',
      lg: 'rounded-lg'
    };

    return `${base} ${variants[this.variant] ?? ''} ${sizes[this.size] ?? ''} ${rounded[this.rounded] ?? ''}`;
  }

  get dotClasses(): string {
    const dots: Record<string, string> = {
      success: 'bg-emerald-400',
      warning: 'bg-amber-400',
      danger: 'bg-rose-400',
      info: 'bg-sky-400',
      neutral: 'bg-slate-400',
      brand: 'bg-indigo-400'
    };
    return dots[this.variant] ?? '';
  }
}
