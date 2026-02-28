import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { BodyMeasurement } from '../../shared/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-measurements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <div>
          <h1>Body Measurements</h1>
          <p>Track how your body composition changes over time</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <div class="layout animate-fade-in stagger-1">
          <div class="card">
            <div class="section-header">
              <h3>Latest Snapshot</h3>
            </div>

            @if (!latest()) {
              <div class="empty-state">
                <span class="material-icons-round">monitor_weight</span>
                <h3>No measurements yet</h3>
                <p>Log your first set of measurements using the form</p>
              </div>
            } @else {
              <div class="snapshot-grid">
                <div class="snap-card" *ngIf="latest()?.weightKg">
                  <span class="label">Weight</span>
                  <div class="value">{{ latest()?.weightKg }} kg</div>
                </div>
                <div class="snap-card" *ngIf="latest()?.bodyFatPercent">
                  <span class="label">Body Fat</span>
                  <div class="value">{{ latest()?.bodyFatPercent }} %</div>
                </div>
                <div class="snap-card" *ngIf="latest()?.waistCm">
                  <span class="label">Waist</span>
                  <div class="value">{{ latest()?.waistCm }} cm</div>
                </div>
                <div class="snap-card" *ngIf="latest()?.hipsCm">
                  <span class="label">Hips</span>
                  <div class="value">{{ latest()?.hipsCm }} cm</div>
                </div>
                <div class="snap-card" *ngIf="latest()?.bicepCm">
                  <span class="label">Bicep</span>
                  <div class="value">{{ latest()?.bicepCm }} cm</div>
                </div>
                <div class="snap-card" *ngIf="latest()?.chestCm">
                  <span class="label">Chest</span>
                  <div class="value">{{ latest()?.chestCm }} cm</div>
                </div>
              </div>
              <div class="snapshot-meta">
                <span>Last updated: {{ latest()?.measuredAt | date:'MMM d, y' }}</span>
                @if (previous()) {
                  <span class="trend" *ngIf="latest()?.weightKg && previous()?.weightKg">
                    Weight change vs last: 
                    <strong [class.positive]="weightDelta() < 0"
                            [class.negative]="weightDelta() > 0">
                      {{ weightDelta() | number:'1.1-1' }} kg
                    </strong>
                  </span>
                }
              </div>
            }
          </div>

          <div class="card">
            <div class="section-header">
              <h3>Log Measurement</h3>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" class="form-control" formControlName="measuredAt" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Weight (kg)</label>
                  <input type="number" class="form-control" formControlName="weightKg" step="0.1" />
                </div>
                <div class="form-group">
                  <label class="form-label">Body Fat (%)</label>
                  <input type="number" class="form-control" formControlName="bodyFatPercent" step="0.1" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Waist (cm)</label>
                  <input type="number" class="form-control" formControlName="waistCm" step="0.5" />
                </div>
                <div class="form-group">
                  <label class="form-label">Hips (cm)</label>
                  <input type="number" class="form-control" formControlName="hipsCm" step="0.5" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Bicep (cm)</label>
                  <input type="number" class="form-control" formControlName="bicepCm" step="0.5" />
                </div>
                <div class="form-group">
                  <label class="form-label">Chest (cm)</label>
                  <input type="number" class="form-control" formControlName="chestCm" step="0.5" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notes</label>
                <input type="text" class="form-control" formControlName="notes" placeholder="Optional notes" />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) { <span class="btn-spinner"></span> }
                  <span class="material-icons-round">add</span>
                  Log Measurement
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="card table-card animate-fade-in stagger-2" *ngIf="measurements().length > 0">
          <div class="section-header">
            <h3>History</h3>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Body Fat</th>
                  <th>Waist</th>
                  <th>Hips</th>
                  <th>Bicep</th>
                  <th>Chest</th>
                </tr>
              </thead>
              <tbody>
                @for (m of measurements(); track m.measurementId) {
                  <tr>
                    <td>{{ m.measuredAt | date:'MMM d, y' }}</td>
                    <td>{{ m.weightKg || '-' }}</td>
                    <td>{{ m.bodyFatPercent || '-' }}</td>
                    <td>{{ m.waistCm || '-' }}</td>
                    <td>{{ m.hipsCm || '-' }}</td>
                    <td>{{ m.bicepCm || '-' }}</td>
                    <td>{{ m.chestCm || '-' }}</td>
                  </tr>
                }
              </tbody>
            </table>
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
    .layout {
      display: grid;
      grid-template-columns: 1.4fr 1.2fr;
      gap: 24px;
      margin-bottom: 24px;
      align-items: flex-start;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .section-header h3 {
      font-size: 18px;
      color: var(--text-primary);
    }
    .snapshot-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }
    .snap-card {
      padding: 14px;
      border-radius: 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .snap-card .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }
    .snap-card .value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .snapshot-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .trend strong {
      margin-left: 4px;
    }
    .trend strong.positive {
      color: var(--success);
    }
    .trend strong.negative {
      color: var(--error);
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
      border-top: 1px solid var(--border-light);
      margin-top: 12px;
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
    .table-card {
      padding: 20px;
    }
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
      padding: 8px 6px;
      white-space: nowrap;
    }
    tbody tr:nth-child(even) {
      background: var(--bg-elevated);
    }
    .empty-state {
      padding: 26px 8px;
      text-align: center;
      color: var(--text-secondary);
    }
    .empty-state .material-icons-round {
      font-size: 38px;
      color: var(--primary-light);
      margin-bottom: 10px;
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
      .snapshot-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class MeasurementsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  measurements = signal<BodyMeasurement[]>([]);

  form = this.fb.group({
    measuredAt: [new Date().toISOString().split('T')[0], Validators.required],
    weightKg: [null as number | null],
    bodyFatPercent: [null as number | null],
    waistCm: [null as number | null],
    hipsCm: [null as number | null],
    bicepCm: [null as number | null],
    chestCm: [null as number | null],
    notes: ['']
  });

  ngOnInit(): void {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    this.api.getBodyMeasurementsForUser(userId).subscribe({
      next: ms => { this.measurements.set(ms); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  latest(): BodyMeasurement | null {
    return this.measurements()[0] || null;
  }

  previous(): BodyMeasurement | null {
    return this.measurements().length > 1 ? this.measurements()[1] : null;
  }

  weightDelta(): number {
    const latest = this.latest();
    const prev = this.previous();
    if (!latest?.weightKg || !prev?.weightKg) return 0;
    return latest.weightKg - prev.weightKg;
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

    this.api.createBodyMeasurement({
      userId,
      measuredAt: new Date(v.measuredAt!).toISOString(),
      weightKg: v.weightKg || undefined,
      bodyFatPercent: v.bodyFatPercent || undefined,
      waistCm: v.waistCm || undefined,
      hipsCm: v.hipsCm || undefined,
      bicepCm: v.bicepCm || undefined,
      chestCm: v.chestCm || undefined,
      notes: v.notes || undefined
    }).subscribe({
      next: m => {
        this.measurements.update(list => [m, ...list]);
        this.saving.set(false);
        this.toast.success('Measurement logged');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to log measurement');
      }
    });
  }
}

