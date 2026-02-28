// ===== USER MODELS =====
export interface User {
  userId: string;
  username: string;
  email: string;
  isActive?: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

// ===== USER PROFILE MODELS =====
export interface UserProfile {
  profileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel: string;
  preferredUnits: string;
  profilePicUrl?: string;
  updatedAt: string;
}

export interface CreateUserProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel?: string;
  preferredUnits?: string;
  profilePicUrl?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel?: string;
  preferredUnits?: string;
  profilePicUrl?: string;
}

// ===== WORKOUT LOG MODELS =====
export interface WorkoutLog {
  workoutLogId: string;
  userId: string;
  workoutDate: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  totalCaloriesBurned?: number;
  workoutType: string;
  notes?: string;
  createdAt: string;
}

export interface CreateWorkoutLogRequest {
  userId: string;
  workoutDate: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  totalCaloriesBurned?: number;
  workoutType: string;
  notes?: string;
}

export interface UpdateWorkoutLogRequest {
  workoutDate?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  totalCaloriesBurned?: number;
  workoutType?: string;
  notes?: string;
}

// ===== WORKOUT EXERCISE MODELS =====
export interface WorkoutExercise {
  workoutExerciseId: string;
  workoutLogId: string;
  exerciseId: string;
  orderIndex: number;
  sets?: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceKm?: number;
  caloriesBurned?: number;
  notes?: string;
  createdAt: string;
}

export interface CreateWorkoutExerciseRequest {
  workoutLogId: string;
  exerciseId: string;
  orderIndex: number;
  sets?: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceKm?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface UpdateWorkoutExerciseRequest {
  orderIndex?: number;
  sets?: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceKm?: number;
  caloriesBurned?: number;
  notes?: string;
}

// ===== AUTH STATE =====
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ===== TOAST =====
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// ===== CONSTANTS =====
export const WORKOUT_TYPES = [
  'Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates',
  'CrossFit', 'Running', 'Cycling', 'Swimming', 'Other'
];

export const ACTIVITY_LEVELS = [
  'Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'
];

export const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export const PREFERRED_UNITS = ['Metric', 'Imperial'];
