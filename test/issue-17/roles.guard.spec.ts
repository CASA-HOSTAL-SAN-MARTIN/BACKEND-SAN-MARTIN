import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { Role } from '../../src/common/enums/roles.enum';

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let guard: RolesGuard;

  const createContext = (roles: Role[] = []): ExecutionContext => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles } }),
    }),
  } as unknown as ExecutionContext);

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows a user whose role is in the route policy', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.CONTABILIDAD]);
    expect(guard.canActivate(createContext([Role.ADMIN_SISTEMA, Role.CONTABILIDAD]))).toBe(true);
  });

  it('rejects users without a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN_FUNDACION]);
    expect(() => guard.canActivate(createContext([Role.ASPIRANTE_RESIDENTE])))
      .toThrow(ForbiddenException);
  });

  it('allows routes without role metadata to be used with authentication alone', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createContext())).toBe(true);
  });
});
