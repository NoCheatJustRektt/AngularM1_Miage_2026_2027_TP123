import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let authServiceMock: { token: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      token: vi.fn(() => 'fake-token'),
      logout: vi.fn(),
    };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  function run(request: HttpRequest<unknown>, next: HttpHandlerFn) {
    return TestBed.runInInjectionContext(() => authInterceptor(request, next));
  }

  it('ajoute le header Authorization quand un token existe', () => {
    const request = new HttpRequest('GET', '/api/users/me');
    const next: HttpHandlerFn = vi.fn((forwarded: HttpRequest<unknown>) => {
      expect(forwarded.headers.get('Authorization')).toBe('Bearer fake-token');
      return of({} as HttpEvent<unknown>);
    });

    run(request, next).subscribe();

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("n'ajoute pas de header Authorization quand il n'y a pas de token", () => {
    authServiceMock.token.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/users/me');
    const next: HttpHandlerFn = vi.fn((forwarded: HttpRequest<unknown>) => {
      expect(forwarded.headers.has('Authorization')).toBe(false);
      return of({} as HttpEvent<unknown>);
    });

    run(request, next).subscribe();

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('déconnecte et redirige vers /login sur un 401 reçu par une route protégée', () => {
    const request = new HttpRequest('GET', '/api/users/me');
    const error = new HttpErrorResponse({ status: 401 });
    const next: HttpHandlerFn = () => throwError(() => error);

    let receivedError: unknown;
    run(request, next).subscribe({ error: (err) => (receivedError = err) });

    expect(receivedError).toBe(error);
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it("ne déconnecte pas et ne redirige pas sur un 401 renvoyé par /auth/login", () => {
    const request = new HttpRequest('POST', '/api/auth/login', {
      email: 'demo@example.com',
      password: 'wrong',
    });
    const error = new HttpErrorResponse({ status: 401 });
    const next: HttpHandlerFn = () => throwError(() => error);

    let receivedError: unknown;
    run(request, next).subscribe({ error: (err) => (receivedError = err) });

    expect(receivedError).toBe(error);
    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('ne déconnecte pas pour une erreur autre que 401', () => {
    const request = new HttpRequest('GET', '/api/users/me');
    const error = new HttpErrorResponse({ status: 500 });
    const next: HttpHandlerFn = () => throwError(() => error);

    let receivedError: unknown;
    run(request, next).subscribe({ error: (err) => (receivedError = err) });

    expect(receivedError).toBe(error);
    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
