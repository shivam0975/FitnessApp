import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Goal } from '../../shared/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <div>
          <h1>Goals</h1>
          <p>Set and track your key fitness goals</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <div class="layout animate-fade-in stagger-1">
          <div class="goals-main card">
            <div class="section-header">
              <h3>Your Goals</h3>
            </div>

            @if (goals().length === 0) {
              <div class="empty-state">
                <span class="material-icons-round">flag</span>
                <h3>No goals yet</h3>
                <p>Create a goal to stay focused on what matters</p>
              </div>
            } @else {
              <div class="goals-list">
                @for (g of goals(); track g.goalId; let i = $index) {
                  <div class="goal-card card-glow animate-fade-in" [style.animation-delay]="(i * 0.05) + 's'">
                    <div class="goal-header">
                      <div>
                        <div class="goal-type">{{ g.goalType }}</div>
                        <div class="goal-name">{{ g.goalName }}</div>
                      </div>
                      <span class="status-pill" [class.completed]="g.status === 'Completed'">
                        {{ g.status }}
                      </span>
                    </div>
                    <div class="goal-progress">
                      <div class="gp-top">
                        <span>{{ g.currentValue }} {{ g.unit }}</span>
                        <span>{{ g.targetValue }} {{ g.unit }}</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width]="getProgress(g) + '%'"></div>
                      </div>
                      <div class="gp-bottom">
                        <span>Start: {{ g.startDate | date:'MMM d, y' }}</span>
                        <span>Target: {{ g.targetDate | date:'MMM d, y' }}</span>
                      </div>
                    </div>
                    <div class="goal-actions">
                      <button class="btn btn-secondary btn-sm" (click)="editGoal(g)">
                        <span class="material-icons-round">edit</span>
                        Edit
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="deleteGoal(g)" [disabled]="deletingId() === g.goalId">
                        @if (deletingId() === g.goalId) { <span class="btn-spinner"></span> }
                        <span class="material-icons-round">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="goals-sidebar">
            <div class="card">
              <h3 class="section-title">
                <span class="material-icons-round">add_task</span>
                {{ editingGoal() ? 'Edit Goal' : 'Create Goal' }}
              </h3>

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-group">
                  <label class="form-label">Goal Type *</label>
                  <select class="form-control" formControlName="goalType">
                    <option value="Weight">Weight</option>
                    <option value="Body Fat">Body Fat</option>
                    <option value="Workout Frequency">Workout Frequency</option>
                    <option value="Distance">Distance</option>
                    <option value="Calories Burned">Calories Burned</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Goal Name *</label>
                  <input type="text" class="form-control" formControlName="goalName" placeholder="e.g. Lose 5 kg" />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Current Value *</label>
                    <input type="number" class="form-control" formControlName="currentValue" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Target Value *</label>
                    <input type="number" class="form-control" formControlName="targetValue" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Unit *</label>
                    <input type="text" class="form-control" formControlName="unit" placeholder="kg, % , km..." />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-control" formControlName="status">
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Start Date *</label>
                    <input type="date" class="form-control" formControlName="startDate" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Target Date *</label>
                    <input type="date" class="form-control" formControlName="targetDate" />
                  </div>
                </div>

                <div class="form-actions">
                  @if (editingGoal()) {
                    <button type="button" class="btn btn-secondary btn-sm" (click)="resetForm()">Cancel</button>
                  }
                  <button type="submit" class="btn btn-primary" [disabled]="saving()">
                    @if (saving()) { <span class="btn-spinner"></span> }
                    <span class="material-icons-round">{{ editingGoal() ? 'save' : 'add' }}</span>
                    {{ editingGoal() ? 'Save Goal' : 'Create Goal' }}
                  </button>
                </div>
              </form>
            </div>
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
      grid-template-columns: 2fr 1.1fr;
      gap: 24px;
      align-items: flex-start;
    }
    .goals-main { padding: 24px; }
    .goals-sidebar { display: flex; flex-direction: column; gap: 16px; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 18px; color: var(--text-primary); margin-bottom: 20px;
    }
    .section-title .material-icons-round { color: var(--primary-light); }
    .goals-list { display: flex; flex-direction: column; gap: 14px; }
    .goal-card {
      padding: 18px 20px;
      border-radius: 16px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .goal-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .goal-type {
      font-size: 12px; color: var(--primary-light);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .goal-name {
      font-size: 16px; font-weight: 600; color: var(--text-primary);
    }
    .status-pill {
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      background: rgba(108,99,255,0.12);
      color: var(--primary-light);
      border: 1px solid rgba(108,99,255,0.3);
    }
    .status-pill.completed {
      background: rgba(16,185,129,0.12);
      border-color: rgba(16,185,129,0.4);
      color: var(--success);
    }
    .goal-progress {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .gp-top, .gp-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .progress-bar {
      position: relative;
      width: 100%;
      height: 7px;
      border-radius: 999px;
      background: var(--bg-card2);
      overflow: hidden;
    }
    .progress-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 999px;
      background: var(--gradient-primary);
      transition: width 0.3s ease;
    }
    .goal-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 4px;
    }
    .btn-spinner {
      width: 14px; height: 14px;
      border-radius: 999px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--text-secondary);
    }
    .empty-state .material-icons-round {
      font-size: 40px;
      color: var(--primary-light);
      margin-bottom: 12px;
    }
    .empty-state h3 {
      font-size: 18px;
      margin-bottom: 4px;
      color: var(--text-primary);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 20px;
      border-top: 1px solid var(--border-light);
      margin-top: 12px;
    }
    @media (max-width: 960px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 640px) {
      .page-container { padding: 20px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class GoalsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  deletingId = signal<string | null>(null);
  goals = signal<Goal[]>([]);
  editingGoal = signal<Goal | null>(null);

  form = this.fb.group({
    goalType: ['Weight', Validators.required],
    goalName: ['', Validators.required],
    currentValue: [0, Validators.required],
    targetValue: [0, Validators.required],
    unit: ['kg', Validators.required],
    status: ['Active'],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    targetDate: [new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], Validators.required]
  });

  ngOnInit(): void {
    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    this.api.getGoalsForUser(userId).subscribe({
      next: g => { this.goals.set(g); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getProgress(g: Goal): number {
    if (!g.targetValue) return 0;
    const raw = (g.currentValue / g.targetValue) * 100;
    const clamped = Math.max(0, Math.min(120, raw));
    return Math.round(clamped);
  }

  resetForm() {
    this.editingGoal.set(null);
    this.form.reset({
      goalType: 'Weight',
      goalName: '',
      currentValue: 0,
      targetValue: 0,
      unit: 'kg',
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });
  }

  editGoal(g: Goal) {
    this.editingGoal.set(g);
    this.form.patchValue({
      goalType: g.goalType,
      goalName: g.goalName,
      currentValue: g.currentValue,
      targetValue: g.targetValue,
      unit: g.unit,
      status: g.status,
      startDate: g.startDate.split('T')[0],
      targetDate: g.targetDate.split('T')[0]
    });
  }

  deleteGoal(g: Goal) {
    this.deletingId.set(g.goalId);
    this.api.deleteGoal(g.goalId).subscribe({
      next: () => {
        this.goals.update(list => list.filter(x => x.goalId !== g.goalId));
        this.deletingId.set(null);
        this.toast.success('Goal deleted');
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Failed to delete goal');
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.auth.getUserIdFromToken();
    if (!userId) return;

    const v = this.form.value;
    const payload = {
      goalType: v.goalType!,
      goalName: v.goalName!,
      currentValue: Number(v.currentValue),
      targetValue: Number(v.targetValue),
      unit: v.unit!,
      startDate: new Date(v.startDate!).toISOString(),
      targetDate: new Date(v.targetDate!).toISOString(),
      status: v.status || 'Active'
    };

    this.saving.set(true);

    const editing = this.editingGoal();
    if (editing) {
      this.api.updateGoal(editing.goalId, payload).subscribe({
        next: () => {
          this.goals.update(list =>
            list.map(g => g.goalId === editing.goalId ? { ...g, ...payload, updatedAt: new Date().toISOString() } : g)
          );
          this.saving.set(false);
          this.toast.success('Goal updated');
          this.resetForm();
        },
        error: () => {
          this.saving.set(false);
          this.toast.error('Failed to update goal');
        }
      });
    } else {
      this.api.createGoal({ userId, ...payload }).subscribe({
        next: g => {
          this.goals.update(list => [g, ...list]);
          this.saving.set(false);
          this.toast.success('Goal created');
          this.resetForm();
        },
        error: () => {
          this.saving.set(false);
          this.toast.error('Failed to create goal');
        }
      });
    }
  }
}

