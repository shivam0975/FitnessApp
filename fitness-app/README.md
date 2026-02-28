# 🏋️ FitTrack — Angular Frontend

A stunning, animated Angular 17 + TypeScript frontend for the FitnessApp API.

## ✨ Features

- **Authentication** — JWT login/register with password strength meter
- **Dashboard** — Stats overview, recent workouts, workout type breakdown, profile summary
- **Workouts** — Full CRUD, search/filter, workout cards with type icons
- **Workout Detail** — View session, add/remove exercises
- **Profile** — Personal info, body metrics, BMI calculator

## 🎨 Design

- Dark theme with purple accent (`#6c63ff`)
- Smooth animations & transitions
- Collapsible sidebar with nav
- Fully responsive (mobile-friendly)
- Material Icons throughout

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API URL
Edit `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'  // ← Point to your ASP.NET API
};
```

### 3. Run the app
```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200)

## 🔌 API Integration

| Controller | Base Route | Auth |
|---|---|---|
| UserController | `/api/user` | Login/Register public, rest requires JWT |
| UserProfileController | `/api/userprofile` | Public |
| WorkoutLogController | `/api/workoutlog` | Public |
| WorkoutExerciseController | `/api/workoutexercise` | Public |

### CORS — Add to your ASP.NET `Program.cs`:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("Angular", policy => {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ...

app.UseCors("Angular");
```

## 📁 Project Structure
```
src/app/
├── core/
│   ├── guards/         # Auth & guest guards
│   ├── interceptors/   # JWT auth interceptor
│   └── services/       # AuthService, ApiService, ToastService
├── features/
│   ├── auth/           # Login & Register pages
│   ├── dashboard/      # Overview dashboard
│   ├── workouts/       # List, Detail, Form
│   └── profile/        # User profile
└── shared/
    ├── components/     # Sidebar, Toast, Spinner
    └── models/         # All TypeScript interfaces
```

## 🛠️ Build for Production
```bash
npm run build
```
Output in `dist/fitness-app/`.
