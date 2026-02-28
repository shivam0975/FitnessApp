import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { NutritionLog } from '../../shared/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <div>
          <h1>Nutrition</h1>
          <p>Log your meals and keep an eye on calories</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <div class="layout animate-fade-in stagger-1">
          <div class="card">
            <div class="section-header">
              <h3>Today&apos;s Summary</h3>
            </div>
            <div class="summary-grid">
              <div class="summary-card">
                <span class="label">Calories</span>
                <div class="value">{{ todayCalories() | number:'1.0-0' }}</div>
                <span class="sub">kcal</span>
              </div>
              <div class="summary-card">
                <span class="label">Protein</span>
                <div class="value">{{ todayProtein() | number:'1.0-0' }}</div>
                <span class="sub">g</span>
              </div>
              <div class="summary-card">
                <span class="label">Carbs</span>
                <div class="value">{{ todayCarbs() | number:'1.0-0' }}</div>
                <span class="sub">g</span>
              </div>
              <div class="summary-card">
                <span class="label">Fat</span>
                <div class="value">{{ todayFat() | number:'1.0-0' }}</div>
                <span class="sub">g</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="section-header">
              <h3>Log Meal</h3>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date *</label>
                  <input type="date" class="form-control" formControlName="logDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">Meal Type *</label>
                  <select class="form-control" formControlName="mealType">
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Food *</label>
                <input type="text" class="form-control" formControlName="foodName" placeholder="e.g. Grilled chicken salad" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Serving Amount *</label>
                  <input type="number" class="form-control" formControlName="servingAmount" />
                </div>
                <div class="form-group">
                  <label class="form-label">Serving Unit *</label>
                  <input type="text" class="form-control" formControlName="servingUnit" placeholder="g, piece, cup..." />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Calories (kcal) *</label>
                  <input type="number" class="form-control" formControlName="caloriesKcal" />
                </div>
                <div class="form-group">
                  <label class="form-label">Protein (g)</label>
                  <input type="number" class="form-control" formControlName="proteinG" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Carbs (g)</label>
                  <input type="number" class="form-control" formControlName="carbsG" />
                </div>
                <div class="form-group">
                  <label class="form-label">Fat (g)</label>
                  <input type="number" class="form-control" formControlName="fatG" />
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) { <span class="btn-spinner"></span> }
                  <span class="material-icons-round">add</span>
                  Add Meal
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="card table-card animate-fade-in stagger-2">
          <div class="section-header">
            <h3>Recent Entries</h3>
          </div>
          @if (logs().length === 0) {
            <div class="empty-state">
              <span class="material-icons-round">restaurant</span>
              <h3>No nutrition logs yet</h3>
              <p>Start by logging your first meal above</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Meal</th>
                    <th>Food</th>
                    <th>Calories</th>
                    <th>P</th>
                    <th>C</th>
                    <th>F</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (n of logs(); track n.nutritionLogId) {
                    <tr>
                      <td>{{ n.logDate | date:'MMM d' }}</td>
                      <td>{{ n.mealType }}</td>
                      <td>{{ n.foodName }}</td>
                      <td>{{ n.caloriesKcal | number:'1.0-0' }}</td>
                      <td>{{ n.proteinG || 0 }}</td>
                      <td>{{ n.carbsG || 0 }}</td>
                      <td>{{ n.fatG || 0 }}</td>
                      <td>
                        <button class="icon-btn danger" (click)="deleteLog(n)" [disabled]="deletingId() === n.nutritionLogId">
                          @if (deletingId() === n.nutritionLogId) {
                            <span class="mini-spinner"></span>
                          } @else {
                            <span class="material-icons-round">delete</span>
                          }
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
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
    .layout {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 24px;
      margin-bottom: 24px;
      align-items: flex-start;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .section-header h3 {
      font-size: 18px;
      color: var(--text-primary);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }
    .summary-card {
      padding: 16px 18px;
      border-radius: 14px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .summary-card .label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .summary-card .sub {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 20px;
      margin-top: 12px;
      border-top: 1px solid var(--border-light);
    }
    .btn-spinner {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
      margin-right: 4px;
    }
    .table-card { padding: 20px; }
    .table-wrapper {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    thead tr {
      text-align: left;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-light);
    }
    th, td {
      padding: 10px 8px;
      white-space: nowrap;
    }
    tbody tr:nth-child(even) {
      background: var(--bg-elevated);
    }
    .icon-btn {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 1px solid var(--border-light);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: var(--transition);
    }
    .icon-btn.danger:hover {
      background: rgba(255,77,109,0.12);
      border-color: rgba(255,77,109,0.4);
      color: var(--error);
    }
    .mini-spinner {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      border: 2px solid rgba(248,113,113,0.4);
      border-top-color: var(--error);
      animation: spin 0.8s linear infinite;
    }
    .empty-state {
      padding: 24px 8px;
      text-align: center;
      color: var(--text-secondary);
    }
    .empty-state .material-icons-round {
      font-size: 36px;
      color: var(--secondary);
      margin-bottom: 8px;
    }
    .empty-state h3 {
      font-size: 18px;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    @media (max-width: 960px) {
      .layout {
        grid-template-columns: 1fr;
      }
      .summary-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class NutritionComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  deletingId = signal<string | null>(null);
  logs = signal<NutritionLog[]>([]);

  form = this.fb.group({
    logDate: [new Date().toISOString().split('T')[0], Validators.required],
    mealType: ['Breakfast', Validators.required],
    foodName: ['', Validators.required],
    servingAmount: [1, Validators.required],
    servingUnit: ['g', Validators.required],
    caloriesKcal: [0, Validators.required],
    proteinG: [null as number | null],
    carbsG: [null as number | null],
    fatG: [null as number | null]
  });

  ngOnInit(): void {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    this.api.getNutritionLogsForUser(userId).subscribe({
      next: logs => { this.logs.set(logs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  private isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getFullYear() === today.getFullYear()
      && d.getMonth() === today.getMonth()
      && d.getDate() === today.getDate();
  }

  todayCalories(): number {
    return this.logs()
      .filter(l => this.isToday(l.logDate))
      .reduce((acc, l) => acc + Number(l.caloriesKcal || 0), 0);
  }

  todayProtein(): number {
    return this.logs()
      .filter(l => this.isToday(l.logDate))
      .reduce((acc, l) => acc + Number(l.proteinG || 0), 0);
  }

  todayCarbs(): number {
    return this.logs()
      .filter(l => this.isToday(l.logDate))
      .reduce((acc, l) => acc + Number(l.carbsG || 0), 0);
  }

  todayFat(): number {
    return this.logs()
      .filter(l => this.isToday(l.logDate))
      .reduce((acc, l) => acc + Number(l.fatG || 0), 0);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    const v = this.form.value;
    this.saving.set(true);

    this.api.createNutritionLog({
      userId,
      logDate: new Date(v.logDate!).toISOString(),
      mealType: v.mealType!,
      foodName: v.foodName!,
      servingAmount: Number(v.servingAmount),
      servingUnit: v.servingUnit!,
      caloriesKcal: Number(v.caloriesKcal),
      proteinG: v.proteinG || undefined,
      carbsG: v.carbsG || undefined,
      fatG: v.fatG || undefined
    }).subscribe({
      next: n => {
        this.logs.update(list => [n, ...list]);
        this.saving.set(false);
        this.toast.success('Meal logged');
        this.form.patchValue({
          foodName: '',
          caloriesKcal: 0,
          proteinG: null,
          carbsG: null,
          fatG: null
        });
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to log meal');
      }
    });
  }

  deleteLog(n: NutritionLog) {
    this.deletingId.set(n.nutritionLogId);
    this.api.deleteNutritionLog(n.nutritionLogId).subscribe({
      next: () => {
        this.logs.update(list => list.filter(x => x.nutritionLogId !== n.nutritionLogId));
        this.deletingId.set(null);
        this.toast.success('Entry deleted');
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Failed to delete entry');
      }
    });
  }
}

