import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [class]="buttonClasses"
    >
      <svg *ngIf="loading" class="mr-2 animate-spin-slow" style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-20"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
      </svg>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .animate-spin-slow {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  @Output() btnClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1120] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';
    
    const variants: Record<string, string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
      secondary: 'bg-white/[0.06] text-slate-300 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white focus:ring-white/20',
      danger: 'bg-rose-600/90 text-white hover:bg-rose-500 focus:ring-rose-500 shadow-lg shadow-rose-500/25',
      ghost: 'bg-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 focus:ring-white/10',
      success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25'
    };

    const sizes: Record<string, string> = {
      sm: 'px-3.5 py-2 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base'
    };

    return `${base} ${variants[this.variant] ?? ''} ${sizes[this.size] ?? ''} ${this.fullWidth ? 'w-full' : ''}`;
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }
}
