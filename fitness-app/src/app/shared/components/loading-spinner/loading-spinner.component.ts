import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrapper" [class.fullscreen]="fullscreen">
      <div class="spinner-ring">
        <div></div><div></div><div></div><div></div>
      </div>
      @if (message) {
        <p class="spinner-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }
    .spinner-wrapper.fullscreen {
      position: fixed;
      inset: 0;
      background: rgba(13, 15, 26, 0.8);
      backdrop-filter: blur(8px);
      z-index: 9999;
    }
    .spinner-ring {
      display: inline-block;
      position: relative;
      width: 48px;
      height: 48px;
    }
    .spinner-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 36px;
      height: 36px;
      margin: 6px;
      border: 3px solid transparent;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .spinner-ring div:nth-child(1) { animation-delay: -0.45s; }
    .spinner-ring div:nth-child(2) { animation-delay: -0.3s; border-top-color: var(--primary-light); }
    .spinner-ring div:nth-child(3) { animation-delay: -0.15s; border-top-color: var(--secondary); }
    .spinner-message { color: var(--text-secondary); font-size: 14px; }
  `]
})
export class LoadingSpinnerComponent {
  @Input() fullscreen = false;
  @Input() message = '';
}
