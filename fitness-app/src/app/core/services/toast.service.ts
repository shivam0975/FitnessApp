import { Injectable, signal } from '@angular/core';
import { Toast } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: Toast['type'] = 'info', duration = 4000): void {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type, duration };
    this._toasts.update(t => [...t, toast]);
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  warning(message: string) { this.show(message, 'warning'); }
  info(message: string) { this.show(message, 'info'); }

  remove(id: string): void {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
