/**
 * Authentication Service
 * Evidence: /angularjs2/controllers/login.js:27-41, /angularjs2/definitions/passport.js:38-80
 * 
 * API Endpoints (all prefixed with /api/):
 * - POST /api/login: username/password auth, returns { success: true } or [{ error: '...' }]
 * - POST /api/session: returns { user: {...}, config: { version: '1.2.3' } }
 * - GET /api/logout: logoff, redirect to /
 * 
 * Cookie-based sessions (withCredentials: true)
 */

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User, SessionResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public currentUser = signal<User | null>(null);
  public isAuthenticated = computed(() => this.currentUser() !== null);
  public isAdmin = computed(() => this.currentUser()?.admin ?? false);

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<LoginResponse>('/api/login/', credentials, { 
      withCredentials: true 
    }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          throw new Error(response[0].error);
        }
        return response.success;
      }),
      catchError(err => {
        return throwError(() => new Error(err.error?.[0]?.error || 'Login failed'));
      })
    );
  }

  loadSession(): Observable<SessionResponse> {
    return this.http.post<SessionResponse>('/api/session/', {}, { 
      withCredentials: true 
    }).pipe(
      tap(session => {
        this.currentUserSubject.next(session.user);
        this.currentUser.set(session.user);
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.get<void>('/api/logout/', { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.currentUser.set(null);
      })
    );
  }

  hasPermission(resource: string, action: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.admin) return true;
    
    return user.rights?.[resource]?.[action] === true;
  }
}
