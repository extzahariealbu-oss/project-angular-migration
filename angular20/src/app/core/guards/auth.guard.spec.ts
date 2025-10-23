import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: any;
  let router: any;

  beforeEach(() => {
    const authServiceSpy = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      loadSession: jest.fn()
    };
    const routerSpy = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
  });

  it('should allow access when authenticated', () => {
    authService.isAuthenticated.mockReturnValue(true);
    
    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when session load fails', (done) => {
    authService.isAuthenticated.mockReturnValue(false);
    authService.loadSession.mockReturnValue(throwError(() => new Error('No session')));
    
    const result$ = TestBed.runInInjectionContext(() => 
      authGuard({} as any, {} as any)
    );

    (result$ as any).subscribe((result: boolean) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
