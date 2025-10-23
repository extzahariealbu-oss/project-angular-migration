import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user successfully', (done) => {
      const credentials = { username: 'test', password: 'password' };

      service.login(credentials).subscribe(success => {
        expect(success).toBe(true);
        done();
      });

      const req = httpMock.expectOne('/login/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush({ success: true });
    });

    it('should handle login error', (done) => {
      const credentials = { username: 'test', password: 'wrong' };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.message).toContain('Login failed');
          done();
        }
      });

      const req = httpMock.expectOne('/login/');
      req.flush([{ error: 'Invalid credentials' }]);
    });
  });

  describe('loadSession', () => {
    it('should load user session and set current user', () => {
      const mockSession = {
        user: { id: '1', username: 'test', admin: false, rights: {} },
        config: { version: '1.0.0' }
      };

      service.loadSession().subscribe(() => {
        expect(service.currentUser()).toEqual(mockSession.user);
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne('/session/');
      expect(req.request.method).toBe('POST');
      req.flush(mockSession);
    });
  });

  describe('logout', () => {
    it('should clear user session', () => {
      service.currentUser.set({ id: '1', username: 'test', admin: false, rights: {} });
      
      service.logout().subscribe(() => {
        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
      });

      const req = httpMock.expectOne('/logout/');
      expect(req.request.method).toBe('GET');
      req.flush(null);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is set', () => {
      service.currentUser.set({ id: '1', username: 'test', admin: false, rights: {} });
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no user is set', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin users', () => {
      service.currentUser.set({ id: '1', username: 'admin', admin: true, rights: {} });
      expect(service.hasPermission('bills', 'create')).toBe(true);
    });

    it('should check rights for non-admin users', () => {
      service.currentUser.set({
        id: '1',
        username: 'user',
        admin: false,
        rights: { bills: { read: true, create: false } }
      });
      expect(service.hasPermission('bills', 'read')).toBe(true);
      expect(service.hasPermission('bills', 'create')).toBe(false);
    });
  });
});
