import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="auth-layout">
      <!-- Left Panel -->
      <div class="auth-visual">
        <div class="visual-content">
          <div class="logo-mark animate-fade-in">
            <span class="material-icons-round">fitness_center</span>
          </div>
          <h1 class="animate-fade-in stagger-1">Transform Your <span class="glow-text">Fitness Journey</span></h1>
          <p class="animate-fade-in stagger-2">Track workouts, monitor progress, and achieve your goals with FitTrack — your intelligent fitness companion.</p>

          <div class="stats-row animate-fade-in stagger-3">
            <div class="stat-pill">
              <span class="material-icons-round">bolt</span>
              <span>Smart Tracking</span>
            </div>
            <div class="stat-pill">
              <span class="material-icons-round">trending_up</span>
              <span>Progress Analytics</span>
            </div>
            <div class="stat-pill">
              <span class="material-icons-round">emoji_events</span>
              <span>Goal Setting</span>
            </div>
          </div>

          <div class="floating-cards">
            <div class="float-card animate-float" style="top: 40%; left: 10%">
              <span class="material-icons-round" style="color: var(--accent)">whatshot</span>
              <div>
                <div class="fc-num">2,450</div>
                <div class="fc-label">Calories Burned</div>
              </div>
            </div>
            <div class="float-card animate-float" style="top: 60%; right: 10%; animation-delay: 1s">
              <span class="material-icons-round" style="color: var(--primary-light)">timer</span>
              <div>
                <div class="fc-num">48 min</div>
                <div class="fc-label">Avg Duration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel / Form -->
      <div class="auth-form-panel">
        <div class="auth-form-container animate-slide-right">
          <div class="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue your fitness journey</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrapper">
                <span class="material-icons-round input-icon">email</span>
                <input
                  type="email"
                  class="form-control"
                  formControlName="email"
                  placeholder="you@example.com"
                />
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="form-error">
                  <span class="material-icons-round" style="font-size:14px">error</span>
                  Valid email is required
                </span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <span class="material-icons-round input-icon">lock</span>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  class="form-control"
                  formControlName="password"
                  placeholder="Enter your password"
                />
                <button type="button" class="toggle-pw" (click)="togglePasswordVisibility()">
                  <span class="material-icons-round">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <span class="form-error">
                  <span class="material-icons-round" style="font-size:14px">error</span>
                  Password is required
                </span>
              }
            </div>

            @if (errorMessage()) {
              <div class="error-alert">
                <span class="material-icons-round">error_outline</span>
                {{ errorMessage() }}
              </div>
            }

            <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading()">
              @if (loading()) {
                <span class="btn-spinner"></span>
                Signing in...
              } @else {
                <span class="material-icons-round">login</span>
                Sign In
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/auth/register">Create one</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      min-height: 100vh;
    }

    .auth-visual {
      flex: 1;
      background: linear-gradient(135deg, #0d0f1a 0%, #131627 40%, #1e1b4b 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;

      &::before {
        content: '';
        position: absolute;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .visual-content {
      position: relative;
      z-index: 1;
      max-width: 520px;
    }

    .logo-mark {
      width: 64px;
      height: 64px;
      background: var(--gradient-primary);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      box-shadow: 0 8px 30px rgba(108,99,255,0.4);
      .material-icons-round { font-size: 32px; color: white; }
    }

    .visual-content h1 {
      font-size: 48px;
      color: white;
      margin-bottom: 20px;
      line-height: 1.1;
    }

    .visual-content p {
      font-size: 18px;
      color: rgba(255,255,255,0.6);
      line-height: 1.7;
      margin-bottom: 40px;
    }

    .stats-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 60px;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 100px;
      color: rgba(255,255,255,0.8);
      font-size: 13px;
      font-weight: 500;
      .material-icons-round { font-size: 16px; color: var(--primary-light); }
    }

    .floating-cards { position: absolute; width: 100%; top: 0; left: 0; height: 100%; pointer-events: none; }

    .float-card {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      .material-icons-round { font-size: 28px; }
    }

    .fc-num { font-size: 18px; font-weight: 700; color: white; }
    .fc-label { font-size: 12px; color: rgba(255,255,255,0.5); }

    .auth-form-panel {
      width: 480px;
      min-width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 48px;
      background: var(--bg-dark);
    }

    .auth-form-container { width: 100%; }

    .auth-form-header {
      margin-bottom: 36px;
      h2 { font-size: 30px; color: var(--text-primary); margin-bottom: 8px; }
      p { color: var(--text-secondary); font-size: 15px; }
    }

    .auth-form { display: flex; flex-direction: column; gap: 4px; }

    .input-wrapper {
      position: relative;
      .input-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 20px;
        color: var(--text-muted);
        pointer-events: none;
      }
      .form-control { padding-left: 46px; }
      .toggle-pw {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
        transition: color 0.2s;
        &:hover { color: var(--text-primary); }
        .material-icons-round { font-size: 20px; }
      }
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: rgba(255,77,109,0.1);
      border: 1px solid rgba(255,77,109,0.3);
      border-radius: 10px;
      color: var(--error);
      font-size: 14px;
      margin-bottom: 8px;
      .material-icons-round { font-size: 20px; }
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .auth-footer {
      margin-top: 28px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
      a { color: var(--primary-light); font-weight: 600; &:hover { color: var(--primary); } }
    }

    @media (max-width: 900px) {
      .auth-layout { flex-direction: column; }
      .auth-visual { display: none; }
      .auth-form-panel { width: 100%; min-width: unset; padding: 40px 24px; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.value;

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.toast.success('Welcome back! 💪');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Invalid email or password. Please try again.');
        } else if (err.status === 403) {
          this.errorMessage.set('Your account has been deactivated.');
        } else {
          this.errorMessage.set('Something went wrong. Please try again.');
        }
      },
      complete: () => this.loading.set(false)
    });
  }
}
