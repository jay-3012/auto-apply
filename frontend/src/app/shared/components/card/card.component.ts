import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <div *ngIf="hasHeader" class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <ng-content select="[card-header]"></ng-content>
      </div>
      
      <div [class]="bodyClasses">
        <ng-content></ng-content>
      </div>

      <div *ngIf="hasFooter" class="px-6 py-4 border-t border-white/[0.06]">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() hasHeader = false;
  @Input() hasFooter = false;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() hover = false;
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' = 'sm';
  @Input() variant: 'default' | 'glass' | 'solid' = 'default';

  get cardClasses(): string {
    const base = 'rounded-2xl overflow-hidden transition-all duration-300';
    
    const variants: Record<string, string> = {
      default: 'bg-slate-800/50 border border-white/[0.06]',
      glass: 'bg-slate-800/30 backdrop-blur-xl border border-white/[0.08]',
      solid: 'bg-slate-800 border border-slate-700/50'
    };

    const shadows: Record<string, string> = {
      none: '',
      sm: 'shadow-lg shadow-black/10',
      md: 'shadow-xl shadow-black/20',
      lg: 'shadow-2xl shadow-black/30'
    };

    const hoverEffect = this.hover 
      ? 'hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
      : '';

    return `${base} ${variants[this.variant] ?? ''} ${shadows[this.shadow] ?? ''} ${hoverEffect}`;
  }

  get bodyClasses(): string {
    const paddings: Record<string, string> = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    return paddings[this.padding] ?? '';
  }
}
