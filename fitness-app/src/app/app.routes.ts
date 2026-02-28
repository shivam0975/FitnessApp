import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'progress',
    canActivate: [authGuard],
    loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent)
  },
  {
    path: 'goals',
    canActivate: [authGuard],
    loadComponent: () => import('./features/goals/goals.component').then(m => m.GoalsComponent)
  },
  {
    path: 'nutrition',
    canActivate: [authGuard],
    loadComponent: () => import('./features/nutrition/nutrition.component').then(m => m.NutritionComponent)
  },
  {
    path: 'measurements',
    canActivate: [authGuard],
    loadComponent: () => import('./features/measurements/measurements.component').then(m => m.MeasurementsComponent)
  },
  {
    path: 'workouts',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/workouts/workout-list/workout-list.component').then(m => m.WorkoutListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/workouts/workout-form/workout-form.component').then(m => m.WorkoutFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/workouts/workout-detail/workout-detail.component').then(m => m.WorkoutDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/workouts/workout-form/workout-form.component').then(m => m.WorkoutFormComponent)
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
