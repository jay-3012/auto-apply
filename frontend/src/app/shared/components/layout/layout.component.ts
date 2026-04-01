import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-root">
      <!-- Sidebar -->
      <aside class="layout-sidebar">
        <!-- Sidebar glow -->
        <div class="sidebar-glow"></div>

        <!-- Logo -->
        <div class="sidebar-logo-area">
          <div class="logo-icon">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:20px;height:20px;color:#fff;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="logo-text-wrap">
            <h1>AutoApply<span>.</span></h1>
            <p>AI Job Pipeline</p>
          </div>
        </div>

        <!-- Divider -->
        <div class="sidebar-divider"></div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <span class="nav-header">Main Menu</span>
          
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <div class="nav-icon">
              <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:16px;height:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            Dashboard
          </a>

          <a routerLink="/applications" routerLinkActive="active" class="nav-link">
            <div class="nav-icon">
              <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:16px;height:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            Applications
          </a>

          <a routerLink="/settings" routerLinkActive="active" class="nav-link">
            <div class="nav-icon">
              <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:16px;height:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Settings
          </a>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
          <button (click)="logout()" class="logout-btn">
            <div class="logout-icon">
              <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:16px;height:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="layout-main-wrapper">
        <!-- Background ambient glow -->
        <div class="main-bg-glow-1"></div>
        <div class="main-bg-glow-2"></div>

        <!-- Header -->
        <header class="layout-header">
          <div class="header-left">
            <h2>Welcome back</h2>
            <div class="header-divider"></div>
            <span class="header-date">{{ currentDate }}</span>
          </div>
          <div class="header-right">
            <!-- Notification bell -->
            <button class="notif-btn">
              <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:16px;height:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span class="notif-dot"></span>
            </button>

            <!-- Avatar -->
            <div class="avatar">
              JV
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    :host {
      display: block;
      height: 100vh;
    }

    .layout-root {
      display: flex;
      height: 100vh;
      background-color: #0B1120;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #cbd5e1;
    }

    /* ── Sidebar ── */
    .layout-sidebar {
      width: 260px;
      background-color: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 20;
    }

    .sidebar-glow {
      position: absolute;
      top: -80px;
      left: -80px;
      width: 240px;
      height: 240px;
      background-color: rgba(79, 70, 229, 0.1);
      filter: blur(100px);
      border-radius: 50%;
      pointer-events: none;
    }

    .sidebar-logo-area {
      padding: 24px 24px 8px;
      display: flex;
      align-items: center;
      position: relative;
    }

    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(to bottom right, #6366f1, #7c3aed);
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
      margin-right: 12px;
    }

    .logo-text-wrap h1 {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .logo-text-wrap h1 span {
      color: #818cf8;
    }
    .logo-text-wrap p {
      font-size: 10px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0;
    }

    .sidebar-divider {
      margin: 12px 20px;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent);
    }

    .sidebar-nav {
      flex: 1;
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 8px;
    }

    .nav-header {
      display: block;
      padding: 8px 16px 12px;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 12px;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
    }
    .nav-link.active {
      background-color: rgba(99, 102, 241, 0.15);
      color: #fff;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .nav-link:not(.active) {
      border: 1px solid transparent;
    }

    .nav-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      transition: background-color 0.2s;
    }
    .nav-link:hover .nav-icon {
      background-color: rgba(255, 255, 255, 0.08);
    }
    .nav-icon svg {
      color: #64748b;
      transition: color 0.2s;
    }
    .nav-link:hover .nav-icon svg {
      color: #818cf8;
    }
    .nav-link.active .nav-icon svg {
      color: #818cf8;
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 10px 16px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      background: transparent;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .logout-btn:hover {
      background-color: rgba(244, 63, 94, 0.1);
      color: #fb7185;
    }
    .logout-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      transition: background-color 0.2s;
    }
    .logout-btn:hover .logout-icon {
      background-color: transparent;
    }
    .logout-icon svg {
      color: #64748b;
      transition: color 0.2s;
    }
    .logout-btn:hover .logout-icon svg {
      color: #fb7185;
    }

    /* ── Main Content ── */
    .layout-main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .main-bg-glow-1 {
      position: absolute;
      top: 0;
      right: 0;
      width: 500px;
      height: 500px;
      background-color: rgba(79, 70, 229, 0.04);
      filter: blur(150px);
      border-radius: 50%;
      pointer-events: none;
    }
    .main-bg-glow-2 {
      position: absolute;
      bottom: 0;
      left: 33%;
      width: 400px;
      height: 400px;
      background-color: rgba(124, 58, 237, 0.03);
      filter: blur(120px);
      border-radius: 50%;
      pointer-events: none;
    }

    .layout-header {
      height: 64px;
      background-color: rgba(11, 17, 32, 0.6);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-left h2 {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }
    .header-divider {
      height: 16px;
      width: 1px;
      background-color: rgba(255, 255, 255, 0.1);
    }
    .header-date {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .notif-btn {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background-color: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .notif-btn:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
    .notif-btn svg {
      color: #94a3b8;
      transition: color 0.2s;
    }
    .notif-btn:hover svg {
      color: #fff;
    }
    .notif-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background-color: #6366f1;
      border-radius: 50%;
      box-shadow: 0 0 0 2px #0B1120;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: linear-gradient(to bottom right, #6366f1, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 12px;
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.2);
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .avatar:hover {
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
    }

    .layout-content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
      position: relative;
    }
  `]
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  get currentDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  logout(): void {
    this.authService.logout();
  }
}
