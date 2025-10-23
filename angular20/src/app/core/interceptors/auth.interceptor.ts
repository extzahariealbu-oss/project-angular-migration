/**
 * Auth Interceptor
 * Evidence: /angularjs2/app/app.js:125-182
 * 
 * 401: reload page (redirect to login)
 * 403: navigate to error page
 * Support errorNotify/successNotify pattern
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        router.navigate(['/login']);
      } else if (err.status === 403) {
        router.navigate(['/error/403']);
      }
      
      return throwError(() => err);
    })
  );
};
