import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const val = control.value || '';
  if (val.length < 8) return { tooShort: true };
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-visual">
        <div class="visual-content">
          <div class="logo-mark animate-fade-in">
            <span class="material-icons-round">fitness_center</span>
          </div>
          <h1 class="animate-fade-in stagger-1">Start Your <span class="glow-text">Transformation</span></h1>
          <p class="animate-fade-in stagger-2">Join thousands of fitness enthusiasts who track their journey with FitTrack.</p>

          <div class="features-list animate-fade-in stagger-3">
            @for (feat of features; track feat.icon) {
              <div class="feature-item">
                <div class="feature-icon">
                  <span class="material-icons-round">{{ feat.icon }}</span>
                </div>
                <div>
                  <div class="feature-title">{{ feat.title }}</div>
                  <div class="feature-desc">{{ feat.desc }}</div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-form-container animate-slide-right">
          <div class="auth-form-header">
            <h2>Create Account</h2>
            <p>Join FitTrack and start your journey today</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Username</label>
              <div class="input-wrapper">
                <span class="material-icons-round input-icon">person</span>
                <input type="text" class="form-control" formControlName="username" placeholder="Choose a username" />
              </div>
              @if (form.get('username')?.invalid && form.get('username')?.touched) {
                <span class="form-error"><span class="material-icons-round" style="font-size:14px">error</span> Username is required</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrapper">
                <span class="material-icons-round input-icon">email</span>
                <input type="email" class="form-control" formControlName="email" placeholder="you@example.com" />
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="form-error"><span class="material-icons-round" style="font-size:14px">error</span> Valid email is required</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <span class="material-icons-round input-icon">lock</span>
                <input [type]="showPassword() ? 'text' : 'password'" class="form-control" formControlName="password" placeholder="Min. 8 characters" />
                <button type="button" class="toggle-pw" (click)="togglePasswordVisibility()">
                  <span class="material-icons-round">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.get('password')?.errors?.['tooShort'] && form.get('password')?.touched) {
                <span class="form-error"><span class="material-icons-round" style="font-size:14px">error</span> Password must be at least 8 characters</span>
              }
              <!-- Password strength -->
              @if (form.get('password')?.value) {
                <div class="pw-strength">
                  <div class="pw-bars">
                    @for (i of [1,2,3,4]; track i) {
                      <div class="pw-bar" [class.active]="getStrength() >= i" [class]="'level-' + Math.min(getStrength(), 4)"></div>
                    }
                  </div>
                  <span class="pw-label" [style.color]="getStrengthColor()">{{ getStrengthLabel() }}</span>
                </div>
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
                Creating Account...
              } @else {
                <span class="material-icons-round">person_add</span>
                Create Account
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout { display: flex; min-height: 100vh; }
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
        width: 600px; height: 600px;
        background: radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%);
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .visual-content { position: relative; z-index: 1; max-width: 480px; }
    .logo-mark {
      width: 64px; height: 64px;
      background: var(--gradient-primary);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 32px;
      box-shadow: 0 8px 30px rgba(108,99,255,0.4);
      .material-icons-round { font-size: 32px; color: white; }
    }
    .visual-content h1 { font-size: 44px; color: white; margin-bottom: 20px; line-height: 1.1; }
    .visual-content p { font-size: 17px; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 40px; }
    .features-list { display: flex; flex-direction: column; gap: 20px; }
    .feature-item {
      display: flex; align-items: flex-start; gap: 16px;
    }
    .feature-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: rgba(108,99,255,0.2);
      border: 1px solid rgba(108,99,255,0.3);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .material-icons-round { font-size: 22px; color: var(--primary-light); }
    }
    .feature-title { font-size: 15px; font-weight: 600; color: white; margin-bottom: 4px; }
    .feature-desc { font-size: 13px; color: rgba(255,255,255,0.5); }
    .auth-form-panel {
      width: 480px; min-width: 480px;
      display: flex; align-items: center; justify-content: center;
      padding: 60px 48px;
      background: var(--bg-dark);
    }
    .auth-form-container { width: 100%; }
    .auth-form-header {
      margin-bottom: 36px;
      h2 { font-size: 30px; color: var(--text-primary); margin-bottom: 8px; }
      p { color: var(--text-secondary); font-size: 15px; }
    }
    .input-wrapper {
      position: relative;
      .input-icon {
        position: absolute; left: 14px; top: 50%;
        transform: translateY(-50%);
        font-size: 20px; color: var(--text-muted); pointer-events: none;
      }
      .form-control { padding-left: 46px; }
      .toggle-pw {
        position: absolute; right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; color: var(--text-muted);
        cursor: pointer; padding: 4px; display: flex;
        .material-icons-round { font-size: 20px; }
      }
    }
    .pw-strength {
      display: flex; align-items: center; gap: 10px; margin-top: 8px;
    }
    .pw-bars { display: flex; gap: 4px; flex: 1; }
    .pw-bar {
      height: 4px; flex: 1; border-radius: 2px;
      background: var(--bg-elevated);
      transition: background 0.3s;
      &.active.level-1 { background: var(--error); }
      &.active.level-2 { background: var(--warning); }
      &.active.level-3 { background: #facc15; }
      &.active.level-4 { background: var(--success); }
    }
    .pw-label { font-size: 12px; font-weight: 600; min-width: 50px; }
    .error-alert {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; background: rgba(255,77,109,0.1);
      border: 1px solid rgba(255,77,109,0.3); border-radius: 10px;
      color: var(--error); font-size: 14px; margin-bottom: 16px;
      .material-icons-round { font-size: 20px; }
    }
    .btn-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .auth-footer {
      margin-top: 28px; text-align: center;
      color: var(--text-secondary); font-size: 14px;
      a { color: var(--primary-light); font-weight: 600; }
    }
    @media (max-width: 900px) {
      .auth-layout { flex-direction: column; }
      .auth-visual { display: none; }
      .auth-form-panel { width: 100%; min-width: unset; padding: 40px 24px; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  Math = Math;
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  features = [
    { icon: 'track_changes', title: 'Track Every Workout', desc: 'Log exercises, sets, reps and weights easily' },
    { icon: 'insights', title: 'Visualize Progress', desc: 'Beautiful charts showing your fitness journey' },
    { icon: 'local_fire_department', title: 'Calorie Tracking', desc: 'Monitor calories burned in every session' },
  ];

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrength]]
  });

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  getStrength(): number {
    const pw = this.form.get('password')?.value || '';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  getStrengthLabel(): string {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.getStrength()] || '';
  }

  getStrengthColor(): string {
    const colors = ['', 'var(--error)', 'var(--warning)', '#facc15', 'var(--success)'];
    return colors[this.getStrength()] || '';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMessage.set('');

    const { username, email, password } = this.form.value;

    this.auth.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => {
        this.toast.success('Account created! Please sign in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Email or username already in use.');
        } else {
          this.errorMessage.set('Registration failed. Please try again.');
        }
      },
      complete: () => this.loading.set(false)
    });
  }
}
