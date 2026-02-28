import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'fittrack_token';
  private readonly USER_KEY = 'fittrack_user';

  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _user = signal<User | null>(this.loadUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/user/login`, req).pipe(
      tap(res => {
        this._token.set(res.token);
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.loadCurrentUser();
      })
    );
  }

  register(req: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/user`, req);
  }

  loadCurrentUser(): void {
    const token = this._token();
    if (!token) return;

    // Decode JWT to get userId
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;

      this.http.get<User>(`${environment.apiUrl}/user/${userId}`).subscribe({
        next: user => {
          this._user.set(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        },
        error: () => this.logout()
      });
    } catch {
      this.logout();
    }
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  getUserIdFromToken(): string | null {
    const token = this._token();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }
}
