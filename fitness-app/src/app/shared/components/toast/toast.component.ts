import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.remove(toast.id)">
          <span class="material-icons-round toast-icon">
            {{ getIcon(toast.type) }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close">
            <span class="material-icons-round" style="font-size:18px">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-icon { font-size: 20px; }
    .toast-success .toast-icon { color: var(--success); }
    .toast-error .toast-icon { color: var(--error); }
    .toast-warning .toast-icon { color: var(--warning); }
    .toast-info .toast-icon { color: var(--primary-light); }
    .toast-message { flex: 1; font-size: 14px; }
    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
      display: flex;
      transition: color 0.2s;
      &:hover { color: var(--text-primary); }
    }
    .toast { cursor: pointer; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type] || 'info';
  }
}
