import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { WORKOUT_TYPES } from '../../../shared/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <div>
          <a routerLink="/workouts" class="back-link">
            <span class="material-icons-round">arrow_back</span>
            Back to Workouts
          </a>
          <h1>{{ isEdit() ? 'Edit Workout' : 'Log New Workout' }}</h1>
          <p>{{ isEdit() ? 'Update your workout details' : 'Record your training session' }}</p>
        </div>
      </div>

      @if (loadingData()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <div class="form-layout animate-fade-in stagger-1">
          <div class="form-main card">
            <h3 class="section-title">
              <span class="material-icons-round">event</span>
              Session Details
            </h3>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Workout Type *</label>
                  <select class="form-control" formControlName="workoutType">
                    @for (type of workoutTypes; track type) {
                      <option [value]="type">{{ type }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Date *</label>
                  <input type="date" class="form-control" formControlName="workoutDate" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Time *</label>
                  <input type="datetime-local" class="form-control" formControlName="startTime" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Time</label>
                  <input type="datetime-local" class="form-control" formControlName="endTime" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Duration (minutes)</label>
                  <div class="input-with-unit">
                    <input type="number" class="form-control" formControlName="durationMinutes" placeholder="60" min="1" />
                    <span class="unit-label">min</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Calories Burned</label>
                  <div class="input-with-unit">
                    <input type="number" class="form-control" formControlName="totalCaloriesBurned" placeholder="350" min="0" />
                    <span class="unit-label">kcal</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea class="form-control" formControlName="notes" rows="4" placeholder="How did the workout go? Any personal records?"></textarea>
              </div>

              <div class="form-actions">
                <a routerLink="/workouts" class="btn btn-secondary">Cancel</a>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) { <span class="btn-spinner"></span> }
                  <span class="material-icons-round">{{ isEdit() ? 'save' : 'add_circle' }}</span>
                  {{ isEdit() ? 'Save Changes' : 'Log Workout' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Sidebar Tips -->
          <div class="form-sidebar">
            <div class="card tips-card">
              <h4>
                <span class="material-icons-round" style="color: var(--primary-light)">tips_and_updates</span>
                Tips
              </h4>
              <div class="tips-list">
                @for (tip of tips; track tip.text) {
                  <div class="tip-item">
                    <span class="material-icons-round tip-icon">{{ tip.icon }}</span>
                    <p>{{ tip.text }}</p>
                  </div>
                }
              </div>
            </div>

            <div class="card quick-types">
              <h4>Quick Select Type</h4>
              <div class="type-chips">
                @for (type of workoutTypes.slice(0, 6); track type) {
                  <button type="button" class="type-chip"
                    [class.active]="form.get('workoutType')?.value === type"
                    (click)="form.get('workoutType')?.setValue(type)">
                    <span class="material-icons-round">{{ getTypeIcon(type) }}</span>
                    {{ type }}
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header { margin-bottom: 28px; }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;
      text-decoration: none; transition: color 0.2s;
      .material-icons-round { font-size: 18px; }
      &:hover { color: var(--primary-light); }
    }
    h1 { font-size: 28px; background: var(--gradient-primary);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; margin-bottom: 6px; }
    p { color: var(--text-secondary); }
    .form-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    .form-main { padding: 28px; }
    .section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 18px; color: var(--text-primary); margin-bottom: 24px;
      .material-icons-round { color: var(--primary-light); }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .input-with-unit { position: relative; }
    .unit-label {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      font-size: 13px; color: var(--text-muted); pointer-events: none;
    }
    textarea.form-control { resize: vertical; min-height: 80px; }
    .form-actions {
      display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;
      padding-top: 24px; border-top: 1px solid var(--border-light);
    }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .form-sidebar { display: flex; flex-direction: column; gap: 20px; }
    .tips-card { padding: 24px; }
    .tips-card h4, .quick-types h4 {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px; margin-bottom: 16px; color: var(--text-primary);
    }
    .tips-list { display: flex; flex-direction: column; gap: 14px; }
    .tip-item {
      display: flex; gap: 12px; align-items: flex-start;
    }
    .tip-icon { font-size: 18px; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
    .tip-item p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
    .quick-types { padding: 24px; }
    .type-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .type-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; border-radius: 100px;
      background: var(--bg-elevated); border: 1px solid var(--border-light);
      color: var(--text-secondary); font-size: 13px; cursor: pointer;
      transition: var(--transition);
      .material-icons-round { font-size: 16px; }
      &:hover, &.active {
        background: rgba(108,99,255,0.15); border-color: var(--primary);
        color: var(--primary-light);
      }
    }
    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
      .form-sidebar { display: none; }
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class WorkoutFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  saving = signal(false);
  loadingData = signal(false);
  workoutId = signal<string | null>(null);
  workoutTypes = WORKOUT_TYPES;

  tips = [
    { icon: 'schedule', text: 'Log start and end time to auto-calculate duration' },
    { icon: 'local_fire_department', text: 'Track calories to monitor your energy expenditure' },
    { icon: 'edit_note', text: 'Add notes to remember what worked well' },
  ];

  form = this.fb.group({
    workoutType: ['Strength', Validators.required],
    workoutDate: [new Date().toISOString().split('T')[0], Validators.required],
    startTime: [this.getDefaultStartTime(), Validators.required],
    endTime: [''],
    durationMinutes: [null as number | null],
    totalCaloriesBurned: [null as number | null],
    notes: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.workoutId.set(id);
      this.loadingData.set(true);
      this.api.getWorkoutLog(id).subscribe({
        next: w => {
          this.form.patchValue({
            workoutType: w.workoutType,
            workoutDate: w.workoutDate.split('T')[0],
            startTime: w.startTime ? w.startTime.substring(0, 16) : '',
            endTime: w.endTime ? w.endTime.substring(0, 16) : '',
            durationMinutes: w.durationMinutes || null,
            totalCaloriesBurned: w.totalCaloriesBurned || null,
            notes: w.notes || ''
          });
          this.loadingData.set(false);
        },
        error: () => { this.loadingData.set(false); this.router.navigate(['/workouts']); }
      });
    }
  }

  getDefaultStartTime(): string {
    const now = new Date();
    return now.toISOString().substring(0, 16);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    const v = this.form.value;

    if (this.isEdit()) {
      this.api.updateWorkoutLog(this.workoutId()!, {
        workoutType: v.workoutType || undefined,
        workoutDate: v.workoutDate ? new Date(v.workoutDate).toISOString() : undefined,
        startTime: v.startTime ? new Date(v.startTime).toISOString() : undefined,
        endTime: v.endTime ? new Date(v.endTime).toISOString() : undefined,
        durationMinutes: v.durationMinutes || undefined,
        totalCaloriesBurned: v.totalCaloriesBurned || undefined,
        notes: v.notes || undefined
      }).subscribe({
        next: () => { this.toast.success('Workout updated!'); this.router.navigate(['/workouts']); },
        error: () => { this.saving.set(false); this.toast.error('Failed to update workout'); }
      });
    } else {
      const userId = this.auth.getUserIdFromToken();
      if (!userId) return;

      this.api.createWorkoutLog({
        userId,
        workoutType: v.workoutType!,
        workoutDate: new Date(v.workoutDate!).toISOString(),
        startTime: new Date(v.startTime!).toISOString(),
        endTime: v.endTime ? new Date(v.endTime).toISOString() : undefined,
        durationMinutes: v.durationMinutes || undefined,
        totalCaloriesBurned: v.totalCaloriesBurned || undefined,
        notes: v.notes || undefined
      }).subscribe({
        next: (log) => {
          this.toast.success('Workout logged! 💪');
          this.router.navigate(['/workouts', log.workoutLogId]);
        },
        error: () => { this.saving.set(false); this.toast.error('Failed to log workout'); }
      });
    }
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Strength': 'fitness_center', 'Cardio': 'directions_run', 'HIIT': 'bolt',
      'Yoga': 'self_improvement', 'Pilates': 'accessibility_new', 'CrossFit': 'sports_gymnastics'
    };
    return icons[type] || 'fitness_center';
  }
}
