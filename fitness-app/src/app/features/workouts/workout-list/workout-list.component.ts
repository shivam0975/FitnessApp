import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutLog, WORKOUT_TYPES } from '../../../shared/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <div>
          <h1>My Workouts</h1>
          <p>{{ filteredWorkouts().length }} sessions logged</p>
        </div>
        <a routerLink="/workouts/new" class="btn btn-primary">
          <span class="material-icons-round">add</span>
          New Workout
        </a>
      </div>

      <!-- Filters -->
      <div class="filters animate-fade-in stagger-1">
        <div class="search-box">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Search workouts..." [(ngModel)]="searchQuery" class="search-input" />
        </div>
        <select [(ngModel)]="selectedType" class="filter-select">
          <option value="">All Types</option>
          @for (type of workoutTypes; track type) {
            <option [value]="type">{{ type }}</option>
          }
        </select>
        <select [(ngModel)]="sortOrder" class="filter-select">
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (filteredWorkouts().length === 0) {
        <div class="empty-state">
          <span class="material-icons-round">fitness_center</span>
          <h3>{{ workouts().length === 0 ? 'No workouts yet' : 'No matching workouts' }}</h3>
          <p>{{ workouts().length === 0 ? 'Start tracking your fitness journey' : 'Try adjusting your search or filters' }}</p>
          @if (workouts().length === 0) {
            <a routerLink="/workouts/new" class="btn btn-primary">Log Your First Workout</a>
          }
        </div>
      } @else {
        <div class="workout-grid animate-fade-in stagger-2">
          @for (workout of filteredWorkouts(); track workout.workoutLogId; let i = $index) {
            <div class="workout-card card card-glow" [style.animation-delay]="(i * 0.05) + 's'">
              <div class="wc-header">
                <div class="wc-type-badge" [style.background]="getTypeGradient(workout.workoutType)">
                  <span class="material-icons-round">{{ getTypeIcon(workout.workoutType) }}</span>
                  <span>{{ workout.workoutType }}</span>
                </div>
                <div class="wc-actions">
                  <a [routerLink]="['/workouts', workout.workoutLogId, 'edit']" class="action-btn" title="Edit">
                    <span class="material-icons-round">edit</span>
                  </a>
                  <button class="action-btn danger" (click)="confirmDelete(workout)" title="Delete">
                    <span class="material-icons-round">delete</span>
                  </button>
                </div>
              </div>

              <div class="wc-date">
                <span class="material-icons-round">calendar_today</span>
                {{ workout.workoutDate | date:'EEEE, MMMM d, y' }}
              </div>

              <div class="wc-stats">
                @if (workout.durationMinutes) {
                  <div class="wc-stat">
                    <span class="material-icons-round">timer</span>
                    <span>{{ workout.durationMinutes }} min</span>
                  </div>
                }
                @if (workout.totalCaloriesBurned) {
                  <div class="wc-stat">
                    <span class="material-icons-round">local_fire_department</span>
                    <span>{{ workout.totalCaloriesBurned | number:'1.0-0' }} cal</span>
                  </div>
                }
              </div>

              @if (workout.notes) {
                <p class="wc-notes">{{ workout.notes }}</p>
              }

              <a [routerLink]="['/workouts', workout.workoutLogId]" class="btn btn-secondary w-full" style="margin-top: 16px">
                <span class="material-icons-round">visibility</span>
                View Details
              </a>
            </div>
          }
        </div>
      }

      <!-- Delete Confirm Modal -->
      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Delete Workout</h2>
              <button class="btn btn-secondary btn-icon" (click)="deleteTarget.set(null)">
                <span class="material-icons-round">close</span>
              </button>
            </div>
            <p style="color: var(--text-secondary)">
              Are you sure you want to delete this <strong style="color: var(--text-primary)">{{ deleteTarget()?.workoutType }}</strong> workout from
              <strong style="color: var(--text-primary)">{{ deleteTarget()?.workoutDate | date:'MMM d' }}</strong>?
              This action cannot be undone.
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn btn-danger" (click)="deleteWorkout()" [disabled]="deleting()">
                @if (deleting()) { <span class="btn-spinner"></span> }
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px;
      h1 { font-size: 28px; background: var(--gradient-primary); -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 6px; }
      p { color: var(--text-secondary); }
    }
    .filters {
      display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap;
    }
    .search-box {
      flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px;
      background: var(--bg-elevated); border: 1px solid var(--border-light);
      border-radius: 10px; padding: 0 14px;
      transition: var(--transition);
      &:focus-within { border-color: var(--primary); }
      .material-icons-round { color: var(--text-muted); font-size: 20px; }
    }
    .search-input {
      background: transparent; border: none; width: 100%;
      color: var(--text-primary); padding: 12px 0; font-size: 14px;
      &::placeholder { color: var(--text-muted); }
    }
    .filter-select {
      background: var(--bg-elevated); border: 1px solid var(--border-light);
      border-radius: 10px; padding: 12px 16px; color: var(--text-primary);
      font-size: 14px; cursor: pointer; min-width: 140px;
      transition: var(--transition);
      &:focus { border-color: var(--primary); }
    }
    .workout-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;
    }
    .workout-card { padding: 20px; }
    .wc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .wc-type-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; border-radius: 100px; color: white;
      font-size: 13px; font-weight: 600;
      .material-icons-round { font-size: 18px; }
    }
    .wc-actions { display: flex; gap: 6px; }
    .action-btn {
      width: 32px; height: 32px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center;
      background: var(--bg-elevated); border: 1px solid var(--border-light);
      color: var(--text-secondary); cursor: pointer; transition: var(--transition);
      text-decoration: none;
      .material-icons-round { font-size: 16px; }
      &:hover { background: var(--bg-card2); color: var(--text-primary); border-color: var(--border); }
      &.danger:hover { background: rgba(255,77,109,0.1); color: var(--error); border-color: rgba(255,77,109,0.3); }
    }
    .wc-date {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; color: var(--text-secondary); margin-bottom: 14px;
      .material-icons-round { font-size: 16px; }
    }
    .wc-stats { display: flex; gap: 16px; margin-bottom: 12px; }
    .wc-stat {
      display: flex; align-items: center; gap: 6px;
      font-size: 14px; color: var(--text-primary); font-weight: 500;
      .material-icons-round { font-size: 18px; color: var(--primary-light); }
    }
    .wc-notes {
      font-size: 13px; color: var(--text-muted);
      overflow: hidden; text-overflow: ellipsis;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin-right: 4px;
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
      .page-header { flex-direction: column; gap: 16px; }
      .workout-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class WorkoutListComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(true);
  deleting = signal(false);
  workouts = signal<WorkoutLog[]>([]);
  deleteTarget = signal<WorkoutLog | null>(null);
  searchQuery = '';
  selectedType = '';
  sortOrder = 'desc';
  workoutTypes = WORKOUT_TYPES;

  ngOnInit() {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;
    this.api.getWorkoutLogsForUser(userId).subscribe({
      next: logs => { this.workouts.set(logs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filteredWorkouts(): WorkoutLog[] {
    let list = [...this.workouts()];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(w => w.workoutType.toLowerCase().includes(q) || (w.notes || '').toLowerCase().includes(q));
    }
    if (this.selectedType) list = list.filter(w => w.workoutType === this.selectedType);
    list.sort((a, b) => {
      const d = new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime();
      return this.sortOrder === 'desc' ? -d : d;
    });
    return list;
  }

  confirmDelete(w: WorkoutLog) { this.deleteTarget.set(w); }

  deleteWorkout() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.deleteWorkoutLog(target.workoutLogId).subscribe({
      next: () => {
        this.workouts.update(list => list.filter(w => w.workoutLogId !== target.workoutLogId));
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.toast.success('Workout deleted');
      },
      error: () => { this.deleting.set(false); this.toast.error('Failed to delete workout'); }
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Strength': 'fitness_center', 'Cardio': 'directions_run', 'HIIT': 'bolt',
      'Yoga': 'self_improvement', 'Pilates': 'accessibility_new', 'CrossFit': 'sports_gymnastics',
      'Running': 'directions_run', 'Cycling': 'directions_bike', 'Swimming': 'pool', 'Other': 'sports'
    };
    return icons[type] || 'fitness_center';
  }

  getTypeGradient(type: string): string {
    const gradients: Record<string, string> = {
      'Strength': 'linear-gradient(135deg, #6c63ff, #a89dff)',
      'Cardio': 'linear-gradient(135deg, #ff6584, #ff8fab)',
      'HIIT': 'linear-gradient(135deg, #fa8231, #ffb142)',
      'Yoga': 'linear-gradient(135deg, #43e97b, #38f9d7)',
      'Running': 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      'Cycling': 'linear-gradient(135deg, #a855f7, #c084fc)',
    };
    return gradients[type] || 'linear-gradient(135deg, #6c63ff, #a89dff)';
  }
}
