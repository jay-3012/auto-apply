import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard.js';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component.js').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component.js').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component.js').then(m => m.DashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/dashboard/dashboard.component.js').then(m => m.DashboardComponent) // Stub for now
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/dashboard/dashboard.component.js').then(m => m.DashboardComponent) // Stub for now
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
