import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes.js';
import { authInterceptor } from './core/interceptors/auth.interceptor.js';
import { Configuration } from '@generated/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    {
      provide: Configuration,
      useValue: new Configuration({
        basePath: 'http://localhost:3000/api'
      })
    }
  ],
};
