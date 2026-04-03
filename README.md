# Fitness App

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](fitness-app/package.json)
[![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)](FitnessAppApi/FitnessAppApi.csproj)

A full-stack fitness tracking application with JWT authentication, a .NET Web API backend, and an Angular frontend.

## What This Project Does

This project provides a complete fitness tracking workflow:

- User registration and login with JWT token authentication
- Create, read, update, and delete personal fitness activities
- Activity status toggling (`Pending` / `Completed`)
- Category, duration, intensity, date, and notes support
- Route protection on the frontend and authorization checks on the backend

### Stack

- Backend: ASP.NET Core (`net10.0`), JWT Bearer auth, BCrypt password hashing
- Frontend: Angular 21 standalone components, RxJS, reactive forms
- Database: MySql

## Why It Is Useful

- Production-style architecture split into controllers, services, and repositories
- End-to-end auth flow (register/login, token storage, guarded routes, secured APIs)
- Clean baseline for extending into team challenges, reminders, tags, or reporting
- Good learning reference for Angular + .NET + MySql integration

## How To Get Started

### Prerequisites

- Node.js 20+ and npm
- .NET SDK 10
- MySql

### 1. Clone and install dependencies

```bash
git clone https://github.com/shivam0975/FitnessApp
cd FitnessApp

cd fitness-app
npm install
cd ..
```

### 2. Configure backend settings

The backend reads configuration from `FitnessAppApi/appsettings.json` and environment overrides.

Set these values before running in your environment:

- `ConnectionStrings__MySql`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`

Example (macOS/Linux):

```bash
export Jwt__Key="replace-with-a-long-random-secret"
export Jwt__Issuer="FitnessApi"
export Jwt__Audience="FitnessApiUsers"
```

### 3. Run the backend API

```bash
cd FitnessAppApi
dotnet restore
dotnet run
```

By default, the API runs on:

- `http://localhost:5137`
- `https://localhost:7185`

OpenAPI/Scalar docs are available in development mode.

### 4. Run the frontend

In a second terminal:

```bash
cd fitness-app
npm start
```

Then open `http://localhost:4200`.

The frontend API URL defaults to `http://localhost:5137` in `fitness-app/src/environments/environment.ts`.

### 5. Troubleshooting

- If the frontend cannot reach the API, ensure the backend is running first (`cd FitnessAppApi && dotnet run`).
- If login fails, verify the API base URL in `fitness-app/src/environments/environment.ts` matches the active backend URL.
- If app startup fails with "address already in use", change ports in `FitnessAppApi/Properties/launchSettings.json`.

## Project Structure

```text
FitnessApp/
├─ FitnessAppApi/  # ASP.NET Core API, auth, activity CRUD
└─ fitness-app/    # Angular UI, auth flow, activity pages/components
```
