import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service.js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-root">
      <div class="login-glow-1"></div>
      <div class="login-glow-2"></div>
      <div class="login-grid"></div>

      <main class="login-main">
        <div class="login-logo-wrap">
          <div class="login-logo-icon">
            <svg fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" style="width:22px;height:22px;color:white;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
            </svg>
          </div>
          <h1 class="login-title">AutoApply<span>.</span></h1>
          <p class="login-subtitle">The intelligent pipeline for modern engineering roles.</p>
        </div>

        <div class="login-card">
          <div class="login-card-shine"></div>

          <form (ngSubmit)="onLogin()">
            <div class="login-field">
              <label class="login-label">Username</label>
              <div class="login-input-wrap">
                <input
                  type="text"
                  class="login-input"
                  name="username"
                  [(ngModel)]="username"
                  required
                  placeholder="Enter your system identifier"
                />
                <svg class="login-input-icon" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" style="width:17px;height:17px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
              </div>
            </div>

            <div class="login-field" style="margin-bottom:4px;">
              <div class="login-forgot-row">
                <label class="login-label" style="margin:0;">Password</label>
                <a href="javascript:void(0)" class="login-forgot">Forgot?</a>
              </div>
              <div class="login-input-wrap" style="margin-top:7px;">
                <input
                  type="password"
                  class="login-input"
                  name="password"
                  [(ngModel)]="password"
                  required
                  placeholder="••••••••"
                  style="letter-spacing:0.12em;"
                />
                <svg class="login-input-icon" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" style="width:17px;height:17px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
              </div>
            </div>

            <div *ngIf="error" class="login-error">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px;flex-shrink:0;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {{ error }}
            </div>

            <button type="submit" class="login-btn" [disabled]="loading" style="margin-top:18px;">
              <div class="login-btn-shimmer"></div>
              <span *ngIf="loading" style="position:relative;z-index:1;display:flex;align-items:center;">
                <svg fill="none" viewBox="0 0 24 24" style="width:15px;height:15px;animation:spin 1s linear infinite;">
                  <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span style="position:relative;z-index:1;">
                {{ loading ? 'Initializing...' : 'Initialize Pipeline' }}
              </span>
              <svg *ngIf="!loading" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="position:relative;z-index:1;width:15px;height:15px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          </form>

          <div class="login-divider">
            <span class="login-access-label">System Access</span>
            <div class="login-cred-pill">
              <div class="login-dot"></div>
              <code class="login-cred-text">admin : password</code>
            </div>
          </div>
        </div>

        <footer class="login-footer">
          Engineered with precision <span>&middot;</span> &copy; {{ currentYear }}
        </footer>
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    @keyframes pulseglow {
      0%,100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes fadeup {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .login-root {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      background: #060a12;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .login-glow-1 {
      position: absolute;
      top: -10%;
      left: -5%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      animation: pulseglow 4s ease-in-out infinite;
    }
    .login-glow-2 {
      position: absolute;
      bottom: -10%;
      right: -5%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      animation: pulseglow 4s ease-in-out infinite;
      animation-delay: 2.5s;
    }
    .login-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .login-main {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: fadeup 0.5s ease-out both;
    }
    .login-logo-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
      text-align: center;
    }
    .login-logo-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.1rem;
      box-shadow: 0 0 28px rgba(99,102,241,0.35);
    }
    .login-title {
      font-size: 28px;
      font-weight: 900;
      color: #f8fafc;
      letter-spacing: -0.03em;
      margin: 0 0 6px;
    }
    .login-title span {
      background: linear-gradient(90deg, #818cf8, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .login-subtitle {
      font-size: 12.5px;
      color: #64748b;
      font-weight: 500;
      margin: 0;
      line-height: 1.5;
    }
    .login-card {
      width: 100%;
      background: rgba(10,15,28,0.82);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      padding: 28px 28px 24px;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }
    .login-card-shine {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
      pointer-events: none;
    }
    .login-field {
      margin-bottom: 18px;
    }
    .login-label {
      display: block;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 7px;
      margin-left: 2px;
    }
    .login-input-wrap {
      position: relative;
    }
    .login-input-icon {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      color: #4f4f6e;
      pointer-events: none;
      transition: color 0.2s;
    }
    .login-input-wrap:focus-within .login-input-icon {
      color: #818cf8;
    }
    .login-input {
      width: 100%;
      box-sizing: border-box;
      background: rgba(4,8,18,0.7);
      border: 1px solid rgba(255,255,255,0.06);
      color: #e2e8f0;
      padding: 11px 14px 11px 40px;
      font-size: 13.5px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      border-radius: 11px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .login-input::placeholder { color: #2d3348; }
    .login-input:focus {
      border-color: rgba(99,102,241,0.5);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }
    .login-forgot-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 7px;
      margin-left: 2px;
      margin-right: 2px;
    }
    .login-forgot {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #6366f1;
      text-decoration: none;
      transition: color 0.2s;
    }
    .login-forgot:hover { color: #a5b4fc; }
    .login-error {
      margin-bottom: 18px;
      background: rgba(244,63,94,0.08);
      color: #fb7185;
      font-size: 12.5px;
      font-weight: 500;
      padding: 10px 14px;
      border-radius: 11px;
      border: 1px solid rgba(244,63,94,0.15);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .login-btn {
      width: 100%;
      padding: 13px 20px;
      background: linear-gradient(90deg, #6366f1 0%, #7c3aed 100%);
      border: none;
      border-radius: 11px;
      color: white;
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 6px 20px -4px rgba(99,102,241,0.45);
      transition: box-shadow 0.2s, transform 0.1s;
      position: relative;
      overflow: hidden;
    }
    .login-btn:hover {
      box-shadow: 0 8px 28px -4px rgba(99,102,241,0.6);
    }
    .login-btn:active { transform: scale(0.98); }
    .login-btn:disabled {
      opacity: 0.7;
      cursor: wait;
    }
    .login-btn-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
      transform: translateX(-100%);
      transition: transform 0s;
    }
    .login-btn:hover .login-btn-shimmer {
      transform: translateX(100%);
      transition: transform 0.6s ease;
    }
    .login-btn:hover svg { transform: translateX(3px); }
    .login-divider {
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .login-access-label {
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: #334155;
    }
    .login-cred-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(4,8,18,0.8);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 7px;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .login-cred-pill:hover { background: rgba(4,8,18,1); }
    .login-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 8px rgba(52,211,153,0.8);
      animation: pulseglow 2s ease-in-out infinite;
      flex-shrink: 0;
    }
    .login-cred-text {
      font-size: 11px;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #34d399;
      letter-spacing: 0.02em;
    }
    .login-footer {
      margin-top: 22px;
      font-size: 11.5px;
      color: rgba(100,116,139,0.6);
      font-weight: 500;
      text-align: center;
    }
    .login-footer span { color: rgba(99,102,241,0.7); margin: 0 5px; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';
  currentYear = new Date().getFullYear();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onLogin(): void {
    if (!this.username || !this.password) return;

    this.loading = true;
    this.error = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Invalid credentials. Please verify your access codes.';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'System offline. Check connection to core servers.';
        this.loading = false;
      }
    });
  }
}
