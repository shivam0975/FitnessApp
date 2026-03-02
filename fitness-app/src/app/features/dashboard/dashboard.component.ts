import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { WorkoutLog, UserProfile, WORKOUT_TYPES } from '../../shared/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header animate-fade-in">
        <div>
          <h1>Good {{ getGreeting() }}, <span class="glow-text">{{ auth.user()?.username }}</span> 👋</h1>
          <p>Here's your fitness overview for today</p>
        </div>
        <a routerLink="/workouts/new" class="btn btn-primary">
          <span class="material-icons-round">add</span>
          Log Workout
        </a>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading your stats..."></app-loading-spinner>
      } @else {
        <!-- Stats Row -->
        <div class="stats-grid animate-fade-in stagger-1">
          <div class="stat-card card card-glow">
            <div class="stat-icon" style="background: rgba(108,99,255,0.15)">
              <span class="material-icons-round" style="color: var(--primary-light)">fitness_center</span>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalWorkouts() }}</div>
              <div class="stat-label">Total Workouts</div>
              <div class="stat-sub">All time</div>
            </div>
          </div>

          <div class="stat-card card card-glow">
            <div class="stat-icon" style="background: rgba(255,101,132,0.15)">
              <span class="material-icons-round" style="color: var(--secondary)">local_fire_department</span>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalCalories() }}</div>
              <div class="stat-label">Calories Burned</div>
              <div class="stat-sub">Total logged</div>
            </div>
          </div>

          <div class="stat-card card card-glow">
            <div class="stat-icon" style="background: rgba(67,233,123,0.15)">
              <span class="material-icons-round" style="color: var(--accent)">timer</span>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalMinutes() }}</div>
              <div class="stat-label">Minutes Trained</div>
              <div class="stat-sub">Total duration</div>
            </div>
          </div>

          <div class="stat-card card card-glow">
            <div class="stat-icon" style="background: rgba(250,130,49,0.15)">
              <span class="material-icons-round" style="color: var(--accent2)">trending_up</span>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ weeklyWorkouts() }}</div>
              <div class="stat-label">This Week</div>
              <div class="stat-sub">Sessions</div>
            </div>
          </div>
        </div>

        <!-- Profile Card + Recent Workouts -->
        <div class="dashboard-main animate-fade-in stagger-2">
          <!-- Recent Workouts -->
          <div class="card recent-workouts">
            <div class="section-header">
              <h3>Recent Workouts</h3>
              <a routerLink="/workouts" class="btn btn-secondary btn-sm">View All</a>
            </div>

            @if (recentWorkouts().length === 0) {
              <div class="empty-state">
                <span class="material-icons-round">fitness_center</span>
                <h3>No workouts yet</h3>
                <p>Start logging your workouts to see them here</p>
                <a routerLink="/workouts/new" class="btn btn-primary btn-sm">Log First Workout</a>
              </div>
            } @else {
              <div class="workout-list">
                @for (workout of recentWorkouts(); track workout.workoutLogId; let i = $index) {
                  <div class="workout-item animate-fade-in" [style.animation-delay]="(i * 0.1) + 's'">
                    <div class="workout-type-icon" [style.background]="getTypeColor(workout.workoutType)">
                      <span class="material-icons-round">{{ getTypeIcon(workout.workoutType) }}</span>
                    </div>
                    <div class="workout-info">
                      <div class="workout-name">{{ workout.workoutType }}</div>
                      <div class="workout-date">{{ workout.workoutDate | date:'EEE, MMM d' }}</div>
                    </div>
                    <div class="workout-stats">
                      @if (workout.durationMinutes) {
                        <span class="badge badge-primary">{{ workout.durationMinutes }} min</span>
                      }
                      @if (workout.totalCaloriesBurned) {
                        <span class="badge badge-warning">{{ workout.totalCaloriesBurned | number:'1.0-0' }} cal</span>
                      }
                    </div>
                    <a [routerLink]="['/workouts', workout.workoutLogId]" class="btn btn-secondary btn-sm">
                      <span class="material-icons-round" style="font-size:16px">arrow_forward</span>
                    </a>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right Column -->
          <div class="dashboard-right">
            <!-- Workout Types Breakdown -->
            <div class="card">
              <div class="section-header">
                <h3>Workout Types</h3>
              </div>
              @if (workoutTypeBreakdown().length === 0) {
                <p style="color: var(--text-muted); font-size: 14px; padding: 20px 0">No data yet</p>
              } @else {
                <div class="type-breakdown">
                  @for (item of workoutTypeBreakdown(); track item.type) {
                    <div class="type-row">
                      <div class="type-info">
                        <span class="material-icons-round type-icon">{{ getTypeIcon(item.type) }}</span>
                        <span class="type-name">{{ item.type }}</span>
                      </div>
                      <div class="type-right">
                        <div class="progress-bar">
                          <div class="progress-fill" [style.width]="item.pct + '%'"></div>
                        </div>
                        <span class="type-count">{{ item.count }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Profile Summary -->
            @if (profile()) {
              <div class="card profile-summary">
                <div class="section-header">
                  <h3>Your Profile</h3>
                  <a routerLink="/profile" class="btn btn-secondary btn-sm">Edit</a>
                </div>
                <div class="profile-stats">
                  @if (profile()?.currentWeightKg) {
                    <div class="profile-stat">
                      <span class="ps-label">Current Weight</span>
                      <span class="ps-value">{{ profile()?.currentWeightKg }} kg</span>
                    </div>
                  }
                  @if (profile()?.targetWeightKg) {
                    <div class="profile-stat">
                      <span class="ps-label">Target Weight</span>
                      <span class="ps-value">{{ profile()?.targetWeightKg }} kg</span>
                    </div>
                  }
                  @if (profile()?.heightCm) {
                    <div class="profile-stat">
                      <span class="ps-label">Height</span>
                      <span class="ps-value">{{ profile()?.heightCm }} cm</span>
                    </div>
                  }
                  <div class="profile-stat">
                    <span class="ps-label">Activity Level</span>
                    <span class="ps-value">{{ profile()?.activityLevel }}</span>
                  </div>
                </div>

                @if (profile()?.currentWeightKg && profile()?.targetWeightKg) {
                  <div class="weight-progress">
                    <div class="wp-label">
                      <span>Weight Goal Progress</span>
                      <span>{{ getWeightProgress() }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width]="getWeightProgress() + '%'"></div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="card profile-cta">
                <span class="material-icons-round" style="font-size:40px; color: var(--primary-light); margin-bottom: 12px">person_add</span>
                <h3>Complete Your Profile</h3>
                <p>Add your fitness goals and personal info</p>
                <a routerLink="/profile" class="btn btn-primary btn-sm" style="margin-top: 16px">Set Up Profile</a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px; }
    .dashboard-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 32px;
      h1 { font-size: 28px; margin-bottom: 6px; }
      p { color: var(--text-secondary); }
    }
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 20px; margin-bottom: 28px;
    }
    .stat-card {
      display: flex; align-items: center; gap: 16px; padding: 20px;
    }
    .stat-icon {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .material-icons-round { font-size: 26px; }
    }
    .stat-number { font-size: 32px; font-weight: 800; font-family: 'Space Grotesk', sans-serif;
      background: var(--gradient-primary); -webkit-background-clip: text;
      -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
    .stat-label { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-top: 4px; }
    .stat-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .dashboard-main { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
      h3 { font-size: 18px; color: var(--text-primary); }
    }
    .workout-list { display: flex; flex-direction: column; gap: 12px; }
    .workout-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px; border-radius: 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-light);
      transition: var(--transition);
      &:hover { border-color: var(--border); background: var(--bg-card2); }
    }
    .workout-type-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .material-icons-round { font-size: 22px; color: white; }
    }
    .workout-info { flex: 1; }
    .workout-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .workout-date { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
    .workout-stats { display: flex; gap: 8px; flex-wrap: wrap; }
    .dashboard-right { display: flex; flex-direction: column; gap: 20px; }
    .type-breakdown { display: flex; flex-direction: column; gap: 14px; }
    .type-row { display: flex; align-items: center; gap: 12px; }
    .type-info { display: flex; align-items: center; gap: 8px; min-width: 120px; }
    .type-icon { font-size: 18px; color: var(--primary-light); }
    .type-name { font-size: 14px; color: var(--text-secondary); }
    .type-right { display: flex; align-items: center; gap: 12px; flex: 1; }
    .type-count { font-size: 14px; font-weight: 600; color: var(--text-primary); min-width: 20px; text-align: right; }
    .profile-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .profile-stat { display: flex; flex-direction: column; gap: 4px; }
    .ps-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .ps-value { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .weight-progress { margin-top: 8px; }
    .wp-label { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
    .profile-cta { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 32px;
      h3 { font-size: 18px; margin-bottom: 8px; }
      p { color: var(--text-muted); font-size: 14px; }
    }
    .recent-workouts { overflow: hidden; }
    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-main { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .dashboard { padding: 20px; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .dashboard-header { flex-direction: column; gap: 16px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);

  loading = signal(true);
  workouts = signal<WorkoutLog[]>([]);
  profile = signal<UserProfile | null>(null);

  ngOnInit() {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    this.api.getWorkoutLogsForUser(userId).subscribe({
      next: logs => { this.workouts.set(logs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.api.getProfileByUser(userId).subscribe({
      next: p => this.profile.set(p),
      error: () => {}
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  totalWorkouts() { return this.workouts().length; }

  totalCalories() {
    return Math.round(this.workouts().reduce((a, w) => a + (w.totalCaloriesBurned || 0), 0));
  }

  totalMinutes() {
    return this.workouts().reduce((a, w) => a + (w.durationMinutes || 0), 0);
  }

  weeklyWorkouts() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.workouts().filter(w => new Date(w.workoutDate) >= weekAgo).length;
  }

  recentWorkouts() { return this.workouts().slice(0, 5); }

  workoutTypeBreakdown() {
    const map = new Map<string, number>();
    this.workouts().forEach(w => map.set(w.workoutType, (map.get(w.workoutType) || 0) + 1));
    const total = this.workouts().length || 1;
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count, pct: Math.round(count / total * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getWeightProgress(): number {
    const p = this.profile();
    if (!p?.currentWeightKg || !p?.targetWeightKg) return 0;
    // Simple: how close are we to target
    const diff = Math.abs(p.currentWeightKg - p.targetWeightKg);
    const progress = Math.max(0, 100 - (diff / p.currentWeightKg * 100));
    return Math.round(progress);
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Strength': 'fitness_center', 'Cardio': 'directions_run', 'HIIT': 'bolt',
      'Yoga': 'self_improvement', 'Pilates': 'accessibility_new', 'CrossFit': 'sports_gymnastics',
      'Running': 'directions_run', 'Cycling': 'directions_bike', 'Swimming': 'pool', 'Other': 'sports'
    };
    return icons[type] || 'fitness_center';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Strength': 'rgba(108,99,255,0.8)', 'Cardio': 'rgba(255,101,132,0.8)',
      'HIIT': 'rgba(250,130,49,0.8)', 'Yoga': 'rgba(67,233,123,0.8)',
      'Running': 'rgba(59,130,246,0.8)', 'Cycling': 'rgba(168,85,247,0.8)'
    };
    return colors[type] || 'rgba(108,99,255,0.8)';
  }
}
