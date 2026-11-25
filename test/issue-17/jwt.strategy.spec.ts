import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy';
import { Usuario } from '../../src/auth/entities/usuario.entity';
import { Role } from '../../src/common/enums/roles.enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let repository: jest.Mocked<Pick<Repository<Usuario>, 'findOne'>>;

  beforeEach(() => {
    repository = { findOne: jest.fn() };
    const config = { getOrThrow: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService;
    strategy = new JwtStrategy(config, repository as unknown as Repository<Usuario>);
  });

  it('loads current roles from the database for an active token', async () => {
    repository.findOne.mockResolvedValue({
      id: 'user-1',
      correo: 'user@example.com',
      activo: true,
      tokenVersion: 3,
      roles: [{ nombre: Role.MONITORA }],
    } as Usuario);

    await expect(strategy.validate({ sub: 'user-1', ver: 3 })).resolves.toEqual({
      id: 'user-1', correo: 'user@example.com', roles: [Role.MONITORA],
    });
  });

  it.each([
    ['missing account', null],
    ['disabled account', { id: 'user-1', activo: false, tokenVersion: 3, roles: [] }],
    ['revoked token', { id: 'user-1', activo: true, tokenVersion: 4, roles: [] }],
  ])('rejects a %s', async (_label, usuario) => {
    repository.findOne.mockResolvedValue(usuario as unknown as Usuario);
    await expect(strategy.validate({ sub: 'user-1', ver: 3 })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
