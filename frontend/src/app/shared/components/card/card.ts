import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      @if (hasHeaderSlot) {
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <ng-content select="[header]"></ng-content>
        </div>
      }
      
      <div class="px-5 py-5 flex-grow">
        @if (cardTitle) {
          <h3 class="text-lg font-semibold text-slate-900 mb-1 leading-tight">{{ cardTitle }}</h3>
        }
        @if (cardSubtitle) {
          <p class="text-sm text-slate-500 mb-4">{{ cardSubtitle }}</p>
        }
        <ng-content></ng-content>
      </div>

      @if (hasFooterSlot) {
        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `
})
export class CardComponent {
  @Input() cardTitle?: string;
  @Input() cardSubtitle?: string;
  @Input() hasHeaderSlot = false;
  @Input() hasFooterSlot = false;
}
