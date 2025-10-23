import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let router: any;

  beforeEach(async () => {
    const authServiceSpy = {
      login: jest.fn()
    };
    const routerSpy = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully and navigate to home', (done) => {
    const mockSession = { user: { id: '1', username: 'test', admin: false, rights: {} }, config: { version: '1.0.0' } };
    authService.login.mockReturnValue(of(true));
    authService.loadSession = jest.fn().mockReturnValue(of(mockSession));

    component.username.set('test');
    component.password.set('password');
    component.onSubmit();

    setTimeout(() => {
      expect(authService.login).toHaveBeenCalledWith({ username: 'test', password: 'password' });
      expect(authService.loadSession).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    }, 200);
  });

  it('should handle login error', (done) => {
    authService.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

    component.username.set('test');
    component.password.set('wrong');
    component.onSubmit();

    setTimeout(() => {
      expect(authService.login).toHaveBeenCalled();
      expect(component.errorMessage()).toBe('Invalid credentials');
      expect(component.isLoading()).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    }, 100);
  });
});
