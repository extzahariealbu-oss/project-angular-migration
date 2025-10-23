/**
 * Permission Guard
 * Evidence: /angularjs2/controllers/menu.js:136-206
 * 
 * Format: "resource.action" (e.g., "societe.read")
 * Admins bypass all checks
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard = (resource: string, action: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasPermission(resource, action)) {
      return true;
    }

    router.navigate(['/error/403']);
    return false;
  };
};
