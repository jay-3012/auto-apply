import { Injectable, inject, signal } from '@angular/core';
import { AuthenticationService } from '@generated/api';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authApi = inject(AuthenticationService);
  private readonly router = inject(Router);

  // Signals for state
  isAuthenticated = signal<boolean>(!!localStorage.getItem('session'));
  currentUser = signal<any | null>(null); // For now, stub

  login(credentials: { username: string; password: string }): Observable<boolean> {
    return this.authApi.authLoginPost({ authLoginPostRequest: credentials }).pipe(
      tap((response: any) => {
        if (response.success && response.token) {
          localStorage.setItem('session', response.token);
          this.isAuthenticated.set(true);
        }
      }),
      map(res => !!res.success),
      catchError(err => {
        console.error('Login failed', err);
        return of(false);
      })
    );
  }

  logout(): void {
    this.authApi.authLogoutPost().subscribe({
      next: () => {
        this.clearSession();
      },
      error: () => {
        // Even if API fails, clear local session
        this.clearSession();
      }
    });
  }

  private clearSession(): void {
    localStorage.removeItem('session');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
