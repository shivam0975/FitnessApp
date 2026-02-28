import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkoutLog, NutritionLog, BodyMeasurement } from '../../shared/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface DailyStat {
  label: string;
  date: string;
  value: number;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <div>
          <h1>Progress Reports</h1>
          <p>Visualize your training, nutrition, and body changes over time</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <div class="grid-layout animate-fade-in stagger-1">
          <!-- Workouts chart -->
          <div class="card chart-card">
            <div class="chart-header">
              <div>
                <h3>Workouts — last 7 days</h3>
                <p>Number of sessions per day</p>
              </div>
              <div class="chip">
                <span class="material-icons-round">fitness_center</span>
                {{ workouts().length }} total
              </div>
            </div>
            @if (workoutSeries().length === 0) {
              <div class="empty-state">
                <span class="material-icons-round">insights</span>
                <h4>No workouts yet</h4>
                <p>Start logging workouts to see your weekly activity.</p>
              </div>
            } @else {
              <div class="bar-chart">
                <div class="bars">
                  @for (d of workoutSeries(); track d.date) {
                    <div class="bar-column">
                      <div class="bar-wrapper">
                        <div
                          class="bar"
                          [style.height.%]="getBarHeight(d.value, workoutMax())"
                          [class.bar-active]="isToday(d.date)">
                          <span class="bar-value" *ngIf="d.value > 0">{{ d.value }}</span>
                        </div>
                      </div>
                      <div class="bar-label">{{ d.label }}</div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Calories chart -->
          <div class="card chart-card">
            <div class="chart-header">
              <div>
                <h3>Calories eaten — last 7 days</h3>
                <p>Total daily intake from logged meals</p>
              </div>
              <div class="chip secondary">
                <span class="material-icons-round">restaurant</span>
                {{ totalCaloriesIntake() | number:'1.0-0' }} kcal total
              </div>
            </div>
            @if (calorieSeries().length === 0) {
              <div class="empty-state">
                <span class="material-icons-round">restaurant</span>
                <h4>No nutrition data</h4>
                <p>Log meals on the Nutrition page to track intake.</p>
              </div>
            } @else {
              <div class="bar-chart">
                <div class="bars">
                  @for (d of calorieSeries(); track d.date) {
                    <div class="bar-column">
                      <div class="bar-wrapper">
                        <div
                          class="bar bar-secondary"
                          [style.height.%]="getBarHeight(d.value, calorieMax())"
                          [class.bar-active]="isToday(d.date)">
                          <span class="bar-value" *ngIf="d.value > 0">{{ d.value | number:'1.0-0' }}</span>
                        </div>
                      </div>
                      <div class="bar-label">{{ d.label }}</div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Weight trend chart -->
          <div class="card chart-card wide-card">
            <div class="chart-header">
              <div>
                <h3>Weight trend</h3>
                <p>Based on your logged body measurements</p>
              </div>
            </div>
            @if (!hasWeightData()) {
              <div class="empty-state">
                <span class="material-icons-round">monitor_weight</span>
                <h4>No weight measurements</h4>
                <p>Log body measurements to see your weight progress over time.</p>
              </div>
            } @else {
              <div class="line-chart">
                <svg viewBox="0 0 100 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="weight-line" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#6c63ff" />
                      <stop offset="100%" stop-color="#a855f7" />
                    </linearGradient>
                  </defs>
                  <polyline
                    [attr.points]="getWeightPoints()"
                    fill="none"
                    stroke="url(#weight-line)"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="line-meta">
                  <div>
                    <span class="label">Start</span>
                    <span class="value">{{ firstWeight()?.weightKg }} kg</span>
                  </div>
                  <div>
                    <span class="label">Latest</span>
                    <span class="value">{{ lastWeight()?.weightKg }} kg</span>
                  </div>
                  <div>
                    <span class="label">Change</span>
                    <span
                      class="value"
                      [class.positive]="weightDelta() < 0"
                      [class.negative]="weightDelta() > 0">
                      {{ weightDelta() | number:'1.1-1' }} kg
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 {
      font-size: 28px;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 6px;
    }
    .page-header p { color: var(--text-secondary); }

    .grid-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      align-items: flex-start;
    }
    .chart-card {
      padding: 22px 22px 20px;
    }
    .wide-card {
      grid-column: 1 / -1;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .chart-header h3 {
      font-size: 18px;
      color: var(--text-primary);
    }
    .chart-header p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(108,99,255,0.12);
      border: 1px solid rgba(108,99,255,0.3);
      font-size: 12px;
      color: var(--primary-light);
    }
    .chip.secondary {
      background: rgba(255,101,132,0.12);
      border-color: rgba(255,101,132,0.35);
      color: var(--secondary);
    }
    .chip .material-icons-round {
      font-size: 16px;
    }

    .bar-chart {
      height: 190px;
      display: flex;
      align-items: flex-end;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
    }
    .bar-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .bar-wrapper {
      position: relative;
      width: 100%;
      height: 140px;
      border-radius: 999px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-light);
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      padding: 4px 3px;
    }
    .bar {
      width: 100%;
      border-radius: 999px;
      background: var(--gradient-primary);
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      transition: height 0.25s ease;
    }
    .bar-secondary {
      background: linear-gradient(135deg, #ff6584, #ffb142);
    }
    .bar-active {
      box-shadow: 0 0 0 1px rgba(255,255,255,0.06);
    }
    .bar-value {
      font-size: 10px;
      color: white;
      margin-bottom: 4px;
    }
    .bar-label {
      font-size: 11px;
      color: var(--text-muted);
    }

    .line-chart {
      height: 220px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .line-chart svg {
      width: 100%;
      height: 150px;
      background: radial-gradient(circle at top, rgba(108,99,255,0.12), transparent 65%);
      border-radius: 16px;
      border: 1px solid var(--border-light);
    }
    .line-meta {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }
    .line-meta > div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .line-meta .label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .line-meta .value {
      font-size: 15px;
      color: var(--text-primary);
      font-weight: 600;
    }
    .line-meta .value.positive {
      color: var(--success);
    }
    .line-meta .value.negative {
      color: var(--error);
    }

    .empty-state {
      padding: 22px 8px;
      text-align: center;
      color: var(--text-secondary);
    }
    .empty-state .material-icons-round {
      font-size: 32px;
      color: var(--primary-light);
      margin-bottom: 10px;
    }
    .empty-state h4 {
      font-size: 16px;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .empty-state p {
      font-size: 13px;
    }

    @media (max-width: 1024px) {
      .grid-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
    }
  `]
})
export class ProgressComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(true);
  workouts = signal<WorkoutLog[]>([]);
  nutritionLogs = signal<NutritionLog[]>([]);
  measurements = signal<BodyMeasurement[]>([]);

  ngOnInit(): void {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) {
      this.loading.set(false);
      this.toast.error('You must be logged in to view progress.');
      return;
    }

    let pending = 3;
    const done = () => {
      pending -= 1;
      if (pending <= 0) this.loading.set(false);
    };

    this.api.getWorkoutLogsForUser(userId).subscribe({
      next: logs => { this.workouts.set(logs); done(); },
      error: () => done()
    });

    this.api.getNutritionLogsForUser(userId).subscribe({
      next: logs => { this.nutritionLogs.set(logs); done(); },
      error: () => done()
    });

    this.api.getBodyMeasurementsForUser(userId).subscribe({
      next: ms => { this.measurements.set(ms); done(); },
      error: () => done()
    });
  }

  // ===== helpers for daily series =====
  private buildDailySeries<T>(days: number, accessor: (item: T) => { date: Date; value: number }, items: T[]): DailyStat[] {
    const today = new Date();
    const series: DailyStat[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);

      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const iso = d.toISOString();

      const total = items.reduce((sum, item) => {
        const { date, value } = accessor(item);
        const cmp = new Date(date);
        cmp.setHours(0, 0, 0, 0);
        return cmp.getTime() === d.getTime() ? sum + value : sum;
      }, 0);

      series.push({ label, date: iso, value: total });
    }

    return series;
  }

  workoutSeries(): DailyStat[] {
    if (!this.workouts().length) return [];
    return this.buildDailySeries<WorkoutLog>(7, w => ({
      date: new Date(w.workoutDate),
      value: 1
    }), this.workouts());
  }

  workoutMax(): number {
    return this.workoutSeries().reduce((m, d) => Math.max(m, d.value), 0) || 1;
  }

  calorieSeries(): DailyStat[] {
    if (!this.nutritionLogs().length) return [];
    return this.buildDailySeries<NutritionLog>(7, n => ({
      date: new Date(n.logDate),
      value: Number(n.caloriesKcal || 0)
    }), this.nutritionLogs());
  }

  calorieMax(): number {
    return this.calorieSeries().reduce((m, d) => Math.max(m, d.value), 0) || 1;
  }

  totalCaloriesIntake(): number {
    return this.nutritionLogs().reduce((sum, n) => sum + Number(n.caloriesKcal || 0), 0);
  }

  getBarHeight(value: number, max: number): number {
    if (max <= 0) return 0;
    const pct = (value / max) * 100;
    return Math.max(4, Math.min(100, pct)); // keep a small visible bar
  }

  isToday(isoDate: string): boolean {
    const d = new Date(isoDate);
    const t = new Date();
    return d.getFullYear() === t.getFullYear()
      && d.getMonth() === t.getMonth()
      && d.getDate() === t.getDate();
  }

  // ===== weight / measurements =====
  hasWeightData(): boolean {
    return this.measurements().some(m => m.weightKg != null);
  }

  private sortedWeightMeasurements(): BodyMeasurement[] {
    return this.measurements()
      .filter(m => m.weightKg != null)
      .slice()
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());
  }

  firstWeight(): BodyMeasurement | null {
    const arr = this.sortedWeightMeasurements();
    return arr[0] || null;
  }

  lastWeight(): BodyMeasurement | null {
    const arr = this.sortedWeightMeasurements();
    return arr[arr.length - 1] || null;
  }

  weightDelta(): number {
    const first = this.firstWeight();
    const last = this.lastWeight();
    if (!first?.weightKg || !last?.weightKg) return 0;
    return last.weightKg - first.weightKg;
  }

  getWeightPoints(): string {
    const data = this.sortedWeightMeasurements();
    if (!data.length) return '';

    const weights = data.map(m => m.weightKg as number);
    let min = Math.min(...weights);
    let max = Math.max(...weights);
    if (max === min) {
      max = min + 1;
    }

    const n = data.length;
    const points: string[] = [];

    data.forEach((m, idx) => {
      const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
      const norm = ((m.weightKg as number) - min) / (max - min);
      const y = 60 - norm * 40; // keep some top/bottom padding
      points.push(`${x},${y}`);
    });

    return points.join(' ');
  }
}

