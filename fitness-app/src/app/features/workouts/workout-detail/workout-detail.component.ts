import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutLog, WorkoutExercise } from '../../../shared/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (workout()) {
        <!-- Header -->
        <div class="detail-header animate-fade-in">
          <a routerLink="/workouts" class="back-link">
            <span class="material-icons-round">arrow_back</span>
            Back to Workouts
          </a>
          <div class="header-main">
            <div class="workout-hero">
              <div class="hero-icon" [style.background]="getTypeGradient(workout()!.workoutType)">
                <span class="material-icons-round">{{ getTypeIcon(workout()!.workoutType) }}</span>
              </div>
              <div>
                <div class="workout-type-label">{{ workout()!.workoutType }}</div>
                <h1>{{ workout()!.workoutDate | date:'EEEE, MMMM d, y' }}</h1>
              </div>
            </div>
            <div class="header-actions">
              <a [routerLink]="['/workouts', workout()!.workoutLogId, 'edit']" class="btn btn-secondary">
                <span class="material-icons-round">edit</span>
                Edit
              </a>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row animate-fade-in stagger-1">
          @if (workout()!.durationMinutes) {
            <div class="stat-pill-card card">
              <span class="material-icons-round pill-icon">timer</span>
              <div class="pill-value">{{ workout()!.durationMinutes }}</div>
              <div class="pill-label">Minutes</div>
            </div>
          }
          @if (workout()!.totalCaloriesBurned) {
            <div class="stat-pill-card card">
              <span class="material-icons-round pill-icon" style="color: var(--secondary)">local_fire_department</span>
              <div class="pill-value">{{ workout()!.totalCaloriesBurned | number:'1.0-0' }}</div>
              <div class="pill-label">Calories</div>
            </div>
          }
          <div class="stat-pill-card card">
            <span class="material-icons-round pill-icon" style="color: var(--accent)">fitness_center</span>
            <div class="pill-value">{{ exercises().length }}</div>
            <div class="pill-label">Exercises</div>
          </div>
          <div class="stat-pill-card card">
            <span class="material-icons-round pill-icon" style="color: var(--accent2)">schedule</span>
            <div class="pill-value">{{ workout()!.startTime | date:'h:mm a' }}</div>
            <div class="pill-label">Start Time</div>
          </div>
        </div>

        <!-- Notes -->
        @if (workout()!.notes) {
          <div class="card notes-card animate-fade-in stagger-2">
            <div class="notes-header">
              <span class="material-icons-round">notes</span>
              <h3>Notes</h3>
            </div>
            <p>{{ workout()!.notes }}</p>
          </div>
        }

        <!-- Exercises -->
        <div class="exercises-section animate-fade-in stagger-2">
          <div class="section-header">
            <h2>
              <span class="material-icons-round">list</span>
              Exercises
            </h2>
            <button class="btn btn-primary btn-sm" (click)="showAddExercise.set(true)">
              <span class="material-icons-round">add</span>
              Add Exercise
            </button>
          </div>

          @if (exercises().length === 0) {
            <div class="empty-state">
              <span class="material-icons-round">sports_gymnastics</span>
              <h3>No exercises logged</h3>
              <p>Add exercises to this workout session</p>
            </div>
          } @else {
            <div class="exercises-list">
              @for (ex of exercises(); track ex.workoutExerciseId; let i = $index) {
                <div class="exercise-card card animate-fade-in" [style.animation-delay]="(i * 0.1) + 's'">
                  <div class="ex-header">
                    <div class="ex-order">{{ ex.orderIndex }}</div>
                    <div class="ex-title">Exercise #{{ i + 1 }}</div>
                    <button class="action-btn danger" (click)="deleteExercise(ex.workoutExerciseId)">
                      <span class="material-icons-round">delete</span>
                    </button>
                  </div>
                  <div class="ex-stats">
                    @if (ex.sets) { <div class="ex-stat"><span>Sets</span><strong>{{ ex.sets }}</strong></div> }
                    @if (ex.reps) { <div class="ex-stat"><span>Reps</span><strong>{{ ex.reps }}</strong></div> }
                    @if (ex.weightKg) { <div class="ex-stat"><span>Weight</span><strong>{{ ex.weightKg }} kg</strong></div> }
                    @if (ex.durationSeconds) { <div class="ex-stat"><span>Duration</span><strong>{{ ex.durationSeconds }}s</strong></div> }
                    @if (ex.distanceKm) { <div class="ex-stat"><span>Distance</span><strong>{{ ex.distanceKm }} km</strong></div> }
                    @if (ex.caloriesBurned) { <div class="ex-stat"><span>Calories</span><strong>{{ ex.caloriesBurned }}</strong></div> }
                  </div>
                  @if (ex.notes) {
                    <p class="ex-notes">{{ ex.notes }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Add Exercise Modal -->
        @if (showAddExercise()) {
          <div class="modal-backdrop" (click)="showAddExercise.set(false)">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Add Exercise</h2>
                <button class="btn btn-secondary btn-icon" (click)="showAddExercise.set(false)">
                  <span class="material-icons-round">close</span>
                </button>
              </div>

              <form [formGroup]="exerciseForm" (ngSubmit)="addExercise()">
                <div class="form-group">
                  <label class="form-label">Exercise ID *</label>
                  <input type="text" class="form-control" formControlName="exerciseId" placeholder="UUID of exercise from library" />
                </div>
                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label">Sets</label>
                    <input type="number" class="form-control" formControlName="sets" placeholder="3" min="1" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Reps</label>
                    <input type="number" class="form-control" formControlName="reps" placeholder="10" min="1" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Weight (kg)</label>
                    <input type="number" class="form-control" formControlName="weightKg" placeholder="60" step="0.5" />
                  </div>
                </div>
                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label">Duration (sec)</label>
                    <input type="number" class="form-control" formControlName="durationSeconds" placeholder="60" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Distance (km)</label>
                    <input type="number" class="form-control" formControlName="distanceKm" placeholder="5" step="0.1" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Calories</label>
                    <input type="number" class="form-control" formControlName="caloriesBurned" placeholder="200" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Notes</label>
                  <input type="text" class="form-control" formControlName="notes" placeholder="Optional notes" />
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" (click)="showAddExercise.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="addingExercise()">
                    @if (addingExercise()) { <span class="btn-spinner"></span> }
                    Add Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;
      text-decoration: none; transition: color 0.2s;
      .material-icons-round { font-size: 18px; }
      &:hover { color: var(--primary-light); }
    }
    .header-main { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .workout-hero { display: flex; align-items: center; gap: 20px; }
    .hero-icon {
      width: 72px; height: 72px; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(108,99,255,0.3);
      .material-icons-round { font-size: 36px; color: white; }
    }
    .workout-type-label { font-size: 14px; color: var(--primary-light); font-weight: 600; margin-bottom: 4px; }
    h1 { font-size: 26px; color: var(--text-primary); }
    .stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-pill-card {
      flex: 1; min-width: 120px; padding: 20px;
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: 8px;
    }
    .pill-icon { font-size: 28px; color: var(--primary-light); }
    .pill-value { font-size: 24px; font-weight: 800; font-family: 'Space Grotesk', sans-serif;
      background: var(--gradient-primary); -webkit-background-clip: text;
      -webkit-text-fill-color: transparent; background-clip: text; }
    .pill-label { font-size: 12px; color: var(--text-muted); }
    .notes-card { margin-bottom: 24px; }
    .notes-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
      .material-icons-round { color: var(--primary-light); }
      h3 { font-size: 16px; color: var(--text-primary); }
    }
    .notes-card p { color: var(--text-secondary); font-size: 15px; line-height: 1.7; }
    .exercises-section {}
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
      h2 { display: flex; align-items: center; gap: 10px; font-size: 22px; color: var(--text-primary);
        .material-icons-round { color: var(--primary-light); }
      }
    }
    .exercises-list { display: flex; flex-direction: column; gap: 14px; }
    .exercise-card { padding: 20px; }
    .ex-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .ex-order {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(108,99,255,0.2); border: 1px solid rgba(108,99,255,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: var(--primary-light);
    }
    .ex-title { font-size: 16px; font-weight: 600; color: var(--text-primary); flex: 1; }
    .action-btn {
      width: 32px; height: 32px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center;
      background: var(--bg-elevated); border: 1px solid var(--border-light);
      color: var(--text-secondary); cursor: pointer; transition: var(--transition);
      .material-icons-round { font-size: 16px; }
      &.danger:hover { background: rgba(255,77,109,0.1); color: var(--error); border-color: rgba(255,77,109,0.3); }
    }
    .ex-stats { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 8px; }
    .ex-stat {
      display: flex; flex-direction: column; gap: 2px;
      span { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
      strong { font-size: 15px; color: var(--text-primary); font-weight: 600; }
    }
    .ex-notes { font-size: 13px; color: var(--text-muted); margin-top: 8px; }
    .form-row-2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin-right: 4px;
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
      .form-row-2 { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class WorkoutDetailComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(true);
  workout = signal<WorkoutLog | null>(null);
  exercises = signal<WorkoutExercise[]>([]);
  showAddExercise = signal(false);
  addingExercise = signal(false);

  exerciseForm = this.fb.group({
    exerciseId: ['', Validators.required],
    sets: [null as number | null],
    reps: [null as number | null],
    weightKg: [null as number | null],
    durationSeconds: [null as number | null],
    distanceKm: [null as number | null],
    caloriesBurned: [null as number | null],
    notes: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/workouts']); return; }

    this.api.getWorkoutLog(id).subscribe({
      next: w => {
        this.workout.set(w);
        this.loading.set(false);
        this.loadExercises(w.workoutLogId);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/workouts']); }
    });
  }

  loadExercises(workoutLogId: string) {
    this.api.getExercisesForLog(workoutLogId).subscribe({
      next: exs => this.exercises.set(exs),
      error: () => {}
    });
  }

  addExercise() {
    if (this.exerciseForm.invalid) { this.exerciseForm.markAllAsTouched(); return; }

    const workoutLogId = this.workout()?.workoutLogId;
    if (!workoutLogId) return;

    const v = this.exerciseForm.value;
    this.addingExercise.set(true);

    this.api.createWorkoutExercise({
      workoutLogId,
      exerciseId: v.exerciseId!,
      orderIndex: this.exercises().length + 1,
      sets: v.sets || undefined,
      reps: v.reps || undefined,
      weightKg: v.weightKg || undefined,
      durationSeconds: v.durationSeconds || undefined,
      distanceKm: v.distanceKm || undefined,
      caloriesBurned: v.caloriesBurned || undefined,
      notes: v.notes || undefined
    }).subscribe({
      next: ex => {
        this.exercises.update(list => [...list, ex]);
        this.showAddExercise.set(false);
        this.exerciseForm.reset();
        this.addingExercise.set(false);
        this.toast.success('Exercise added!');
      },
      error: () => { this.addingExercise.set(false); this.toast.error('Failed to add exercise'); }
    });
  }

  deleteExercise(id: string) {
    this.api.deleteWorkoutExercise(id).subscribe({
      next: () => {
        this.exercises.update(list => list.filter(e => e.workoutExerciseId !== id));
        this.toast.success('Exercise removed');
      },
      error: () => this.toast.error('Failed to remove exercise')
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Strength': 'fitness_center', 'Cardio': 'directions_run', 'HIIT': 'bolt',
      'Yoga': 'self_improvement', 'Pilates': 'accessibility_new', 'CrossFit': 'sports_gymnastics',
      'Running': 'directions_run', 'Cycling': 'directions_bike', 'Swimming': 'pool'
    };
    return icons[type] || 'fitness_center';
  }

  getTypeGradient(type: string): string {
    const gradients: Record<string, string> = {
      'Strength': 'linear-gradient(135deg, #6c63ff, #a89dff)',
      'Cardio': 'linear-gradient(135deg, #ff6584, #ff8fab)',
      'HIIT': 'linear-gradient(135deg, #fa8231, #ffb142)',
      'Yoga': 'linear-gradient(135deg, #43e97b, #38f9d7)',
    };
    return gradients[type] || 'linear-gradient(135deg, #6c63ff, #a89dff)';
  }
}
