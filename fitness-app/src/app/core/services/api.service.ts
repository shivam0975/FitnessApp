import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User, UpdateUserRequest,
  UserProfile, CreateUserProfileRequest, UpdateUserProfileRequest,
  WorkoutLog, CreateWorkoutLogRequest, UpdateWorkoutLogRequest,
  WorkoutExercise, CreateWorkoutExerciseRequest, UpdateWorkoutExerciseRequest,
  Goal, CreateGoalRequest, UpdateGoalRequest,
  NutritionLog, CreateNutritionLogRequest, UpdateNutritionLogRequest,
  BodyMeasurement, CreateBodyMeasurementRequest, UpdateBodyMeasurementRequest,
  Exercise
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ===== USERS =====
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/User`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/User/${id}`);
  }

  updateUser(id: string, req: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/User/${id}`, req);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/User/${id}`);
  }

  // ===== USER PROFILES =====
  getProfile(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/UserProfile/${id}`);
  }

  getProfileByUser(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/UserProfile/user/${userId}`);
  }

  createProfile(req: CreateUserProfileRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.base}/UserProfile`, req);
  }

  updateProfile(id: string, req: UpdateUserProfileRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/UserProfile/${id}`, req);
  }

  // ===== WORKOUT LOGS =====
  getWorkoutLogs(): Observable<WorkoutLog[]> {
    return this.http.get<WorkoutLog[]>(`${this.base}/WorkoutLog`);
  }

  getWorkoutLog(id: string): Observable<WorkoutLog> {
    return this.http.get<WorkoutLog>(`${this.base}/WorkoutLog/${id}`);
  }

  getWorkoutLogsForUser(userId: string): Observable<WorkoutLog[]> {
    return this.http.get<WorkoutLog[]>(`${this.base}/WorkoutLog/user/${userId}`);
  }

  createWorkoutLog(req: CreateWorkoutLogRequest): Observable<WorkoutLog> {
    return this.http.post<WorkoutLog>(`${this.base}/WorkoutLog`, req);
  }

  updateWorkoutLog(id: string, req: UpdateWorkoutLogRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/WorkoutLog/${id}`, req);
  }

  deleteWorkoutLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/WorkoutLog/${id}`);
  }

  // ===== WORKOUT EXERCISES =====
  getWorkoutExercises(): Observable<WorkoutExercise[]> {
    return this.http.get<WorkoutExercise[]>(`${this.base}/WorkoutExercise`);
  }

  getWorkoutExercise(id: string): Observable<WorkoutExercise> {
    return this.http.get<WorkoutExercise>(`${this.base}/WorkoutExercise/${id}`);
  }

  getExercisesForLog(workoutLogId: string): Observable<WorkoutExercise[]> {
    return this.http.get<WorkoutExercise[]>(`${this.base}/WorkoutExercise/log/${workoutLogId}`);
  }

  createWorkoutExercise(req: CreateWorkoutExerciseRequest): Observable<WorkoutExercise> {
    return this.http.post<WorkoutExercise>(`${this.base}/WorkoutExercise`, req);
  }

  updateWorkoutExercise(id: string, req: UpdateWorkoutExerciseRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/WorkoutExercise/${id}`, req);
  }

  deleteWorkoutExercise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/WorkoutExercise/${id}`);
  }

  // ===== GOALS =====
  getGoalsForUser(userId: string): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.base}/Goal/user/${userId}`);
  }

  createGoal(req: CreateGoalRequest): Observable<Goal> {
    return this.http.post<Goal>(`${this.base}/Goal`, req);
  }

  updateGoal(id: string, req: UpdateGoalRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/Goal/${id}`, req);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/Goal/${id}`);
  }

  // ===== NUTRITION LOGS =====
  getNutritionLogsForUser(userId: string): Observable<NutritionLog[]> {
    return this.http.get<NutritionLog[]>(`${this.base}/NutritionLog/user/${userId}`);
  }

  createNutritionLog(req: CreateNutritionLogRequest): Observable<NutritionLog> {
    return this.http.post<NutritionLog>(`${this.base}/NutritionLog`, req);
  }

  updateNutritionLog(id: string, req: UpdateNutritionLogRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/NutritionLog/${id}`, req);
  }

  deleteNutritionLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/NutritionLog/${id}`);
  }

  // ===== BODY MEASUREMENTS =====
  getBodyMeasurementsForUser(userId: string): Observable<BodyMeasurement[]> {
    return this.http.get<BodyMeasurement[]>(`${this.base}/BodyMeasurement/user/${userId}`);
  }

  createBodyMeasurement(req: CreateBodyMeasurementRequest): Observable<BodyMeasurement> {
    return this.http.post<BodyMeasurement>(`${this.base}/BodyMeasurement`, req);
  }

  updateBodyMeasurement(id: string, req: UpdateBodyMeasurementRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/BodyMeasurement/${id}`, req);
  }

  deleteBodyMeasurement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/BodyMeasurement/${id}`);
  }

  // ===== EXERCISE LIBRARY =====
  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.base}/ExerciseLibrary`);
  }
}
