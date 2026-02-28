import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserProfile, ACTIVITY_LEVELS, GENDERS, PREFERRED_UNITS } from '../../shared/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <h1>My Profile</h1>
        <p>Manage your personal information and fitness goals</p>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <div class="profile-layout">
          <!-- Profile Card -->
          <div class="profile-sidebar animate-fade-in stagger-1">
            <div class="card profile-card">
              <div class="avatar-section">
                <div class="avatar-large">
                  {{ getInitials() }}
                </div>
                <h3>{{ auth.user()?.username }}</h3>
                <p class="email">{{ auth.user()?.email }}</p>
                @if (profile()) {
                  <div class="badge badge-success" style="margin-top: 12px">Profile Complete</div>
                } @else {
                  <div class="badge badge-warning" style="margin-top: 12px">Profile Incomplete</div>
                }
              </div>

              @if (profile()) {
                <div class="divider"></div>
                <div class="profile-info-list">
                  @if (profile()?.heightCm) {
                    <div class="info-row">
                      <span class="material-icons-round">height</span>
                      <div>
                        <div class="info-label">Height</div>
                        <div class="info-value">{{ profile()?.heightCm }} cm</div>
                      </div>
                    </div>
                  }
                  @if (profile()?.currentWeightKg) {
                    <div class="info-row">
                      <span class="material-icons-round">monitor_weight</span>
                      <div>
                        <div class="info-label">Current Weight</div>
                        <div class="info-value">{{ profile()?.currentWeightKg }} kg</div>
                      </div>
                    </div>
                  }
                  @if (profile()?.targetWeightKg) {
                    <div class="info-row">
                      <span class="material-icons-round">emoji_events</span>
                      <div>
                        <div class="info-label">Target Weight</div>
                        <div class="info-value">{{ profile()?.targetWeightKg }} kg</div>
                      </div>
                    </div>
                  }
                  <div class="info-row">
                    <span class="material-icons-round">bolt</span>
                    <div>
                      <div class="info-label">Activity Level</div>
                      <div class="info-value">{{ profile()?.activityLevel }}</div>
                    </div>
                  </div>
                  @if (getBMI()) {
                    <div class="bmi-display">
                      <div class="bmi-value">{{ getBMI() }}</div>
                      <div class="bmi-label">BMI — {{ getBMICategory() }}</div>
                      <div class="progress-bar" style="margin-top: 8px">
                        <div class="progress-fill" [style.width]="getBMIPercentage() + '%'"
                          [style.background]="getBMIColor()"></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Form -->
          <div class="profile-main animate-fade-in stagger-2">
            <div class="card">
              <h3 class="section-title">
                <span class="material-icons-round">person</span>
                Personal Information
              </h3>

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input type="text" class="form-control" formControlName="firstName" placeholder="John" />
                    @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                      <span class="form-error"><span class="material-icons-round" style="font-size:14px">error</span> Required</span>
                    }
                  </div>
                  <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input type="text" class="form-control" formControlName="lastName" placeholder="Doe" />
                    @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                      <span class="form-error"><span class="material-icons-round" style="font-size:14px">error</span> Required</span>
                    }
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Date of Birth *</label>
                    <input type="date" class="form-control" formControlName="dateOfBirth" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select class="form-control" formControlName="gender">
                      <option value="">Prefer not to say</option>
                      @for (g of genders; track g) {
                        <option [value]="g">{{ g }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="divider"></div>
                <h4 class="sub-section-title">
                  <span class="material-icons-round">monitor_weight</span>
                  Body Metrics
                </h4>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Height (cm)</label>
                    <div class="input-with-unit">
                      <input type="number" class="form-control" formControlName="heightCm" placeholder="175" step="0.5" />
                      <span class="unit-label">cm</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Current Weight (kg)</label>
                    <div class="input-with-unit">
                      <input type="number" class="form-control" formControlName="currentWeightKg" placeholder="70" step="0.1" />
                      <span class="unit-label">kg</span>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Target Weight (kg)</label>
                    <div class="input-with-unit">
                      <input type="number" class="form-control" formControlName="targetWeightKg" placeholder="65" step="0.1" />
                      <span class="unit-label">kg</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Activity Level</label>
                    <select class="form-control" formControlName="activityLevel">
                      @for (level of activityLevels; track level) {
                        <option [value]="level">{{ level }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Preferred Units</label>
                  <div class="units-toggle">
                    @for (unit of preferredUnits; track unit) {
                      <button type="button"
                        class="unit-btn"
                        [class.active]="form.get('preferredUnits')?.value === unit"
                        (click)="form.get('preferredUnits')?.setValue(unit)">
                        {{ unit }}
                      </button>
                    }
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" [disabled]="saving()">
                    @if (saving()) { <span class="btn-spinner"></span> }
                    <span class="material-icons-round">save</span>
                    {{ profile() ? 'Save Changes' : 'Create Profile' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Account Info -->
            <div class="card" style="margin-top: 20px">
              <h3 class="section-title">
                <span class="material-icons-round">manage_accounts</span>
                Account
              </h3>
              <div class="account-info">
                <div class="account-row">
                  <div>
                    <div class="account-label">Username</div>
                    <div class="account-value">{{ auth.user()?.username }}</div>
                  </div>
                  <span class="badge badge-success">Active</span>
                </div>
                <div class="account-row">
                  <div>
                    <div class="account-label">Email</div>
                    <div class="account-value">{{ auth.user()?.email }}</div>
                  </div>
                  @if (auth.user()?.isEmailVerified) {
                    <span class="badge badge-success">Verified</span>
                  } @else {
                    <span class="badge badge-warning">Unverified</span>
                  }
                </div>
                <div class="account-row">
                  <div>
                    <div class="account-label">Member Since</div>
                    <div class="account-value">{{ auth.user()?.createdAt | date:'MMMM d, y' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header { margin-bottom: 32px;
      h1 { font-size: 28px; background: var(--gradient-primary); -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 6px; }
      p { color: var(--text-secondary); }
    }
    .profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
    .profile-card { padding: 28px; }
    .avatar-section { text-align: center; }
    .avatar-large {
      width: 100px; height: 100px; border-radius: 50%;
      background: var(--gradient-primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 700; color: white;
      margin: 0 auto 16px;
      box-shadow: 0 8px 30px rgba(108,99,255,0.4);
    }
    .avatar-section h3 { font-size: 20px; color: var(--text-primary); margin-bottom: 4px; }
    .email { color: var(--text-muted); font-size: 13px; }
    .profile-info-list { display: flex; flex-direction: column; gap: 16px; }
    .info-row { display: flex; align-items: flex-start; gap: 12px;
      .material-icons-round { font-size: 20px; color: var(--primary-light); margin-top: 2px; }
    }
    .info-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .bmi-display { padding: 16px; background: var(--bg-elevated); border-radius: 12px; margin-top: 4px; text-align: center; }
    .bmi-value { font-size: 32px; font-weight: 800; font-family: 'Space Grotesk', sans-serif;
      background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .bmi-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    .section-title { display: flex; align-items: center; gap: 10px; font-size: 18px; color: var(--text-primary); margin-bottom: 24px;
      .material-icons-round { color: var(--primary-light); }
    }
    .sub-section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--text-secondary); margin-bottom: 20px;
      .material-icons-round { font-size: 18px; color: var(--primary-light); }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .input-with-unit { position: relative; }
    .unit-label { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--text-muted); }
    .units-toggle { display: flex; gap: 0; border: 1px solid var(--border-light); border-radius: 10px; overflow: hidden; }
    .unit-btn {
      flex: 1; padding: 12px; background: transparent; color: var(--text-secondary);
      font-size: 14px; font-weight: 500; cursor: pointer; transition: var(--transition);
      border: none;
      &.active { background: rgba(108,99,255,0.2); color: var(--primary-light); }
      &:hover:not(.active) { background: var(--bg-elevated); }
    }
    .form-actions { display: flex; justify-content: flex-end; padding-top: 24px; border-top: 1px solid var(--border-light); margin-top: 8px; }
    .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .account-info { display: flex; flex-direction: column; gap: 0; }
    .account-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }
    .account-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .account-value { font-size: 15px; color: var(--text-primary); font-weight: 500; }
    @media (max-width: 900px) {
      .profile-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  profile = signal<UserProfile | null>(null);

  activityLevels = ACTIVITY_LEVELS;
  genders = GENDERS;
  preferredUnits = PREFERRED_UNITS;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: [''],
    heightCm: [null as number | null],
    currentWeightKg: [null as number | null],
    targetWeightKg: [null as number | null],
    activityLevel: ['Moderate'],
    preferredUnits: ['Metric']
  });

  ngOnInit() {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    this.api.getProfileByUser(userId).subscribe({
      next: p => {
        this.profile.set(p);
        this.form.patchValue({
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth.split('T')[0],
          gender: p.gender || '',
          heightCm: p.heightCm || null,
          currentWeightKg: p.currentWeightKg || null,
          targetWeightKg: p.targetWeightKg || null,
          activityLevel: p.activityLevel,
          preferredUnits: p.preferredUnits
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    const v = this.form.value;
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    const data = {
      firstName: v.firstName!,
      lastName: v.lastName!,
      dateOfBirth: new Date(v.dateOfBirth!).toISOString(),
      gender: v.gender || undefined,
      heightCm: v.heightCm || undefined,
      currentWeightKg: v.currentWeightKg || undefined,
      targetWeightKg: v.targetWeightKg || undefined,
      activityLevel: v.activityLevel!,
      preferredUnits: v.preferredUnits!
    };

    const currentProfile = this.profile();

    if (currentProfile) {
      this.api.updateProfile(currentProfile.profileId, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Profile updated!');
          this.profile.update(p => p ? { ...p, ...data } : p);
        },
        error: () => { this.saving.set(false); this.toast.error('Failed to update profile'); }
      });
    } else {
      this.api.createProfile({ userId, ...data }).subscribe({
        next: p => {
          this.saving.set(false);
          this.profile.set(p);
          this.toast.success('Profile created!');
        },
        error: () => { this.saving.set(false); this.toast.error('Failed to create profile'); }
      });
    }
  }

  getInitials(): string {
    const p = this.profile();
    if (p) return (p.firstName[0] + p.lastName[0]).toUpperCase();
    return (this.auth.user()?.username?.substring(0, 2) || 'U').toUpperCase();
  }

  getBMI(): string {
    const p = this.profile();
    if (!p?.heightCm || !p?.currentWeightKg) return '';
    const bmi = p.currentWeightKg / Math.pow(p.heightCm / 100, 2);
    return bmi.toFixed(1);
  }

  getBMICategory(): string {
    const bmi = parseFloat(this.getBMI());
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  getBMIPercentage(): number {
    const bmi = parseFloat(this.getBMI());
    return Math.min(100, Math.round((bmi / 40) * 100));
  }

  getBMIColor(): string {
    const bmi = parseFloat(this.getBMI());
    if (bmi < 18.5) return '#3b82f6';
    if (bmi < 25) return 'var(--success)';
    if (bmi < 30) return 'var(--warning)';
    return 'var(--error)';
  }
}
