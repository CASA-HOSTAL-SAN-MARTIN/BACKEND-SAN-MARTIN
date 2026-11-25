import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { compare } from 'bcrypt';
import { AuthService } from '../../src/auth/auth.service';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { Usuario } from '../../src/auth/entities/usuario.entity';
import { Role } from '../../src/common/enums/roles.enum';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<Pick<Repository<Usuario>, 'createQueryBuilder' | 'increment' | 'findOne'>>;
  let queryBuilder: jest.Mocked<Pick<SelectQueryBuilder<Usuario>,
    'addSelect' | 'leftJoinAndSelect' | 'where' | 'getOne'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  const user = {
    id: 'user-1',
    correo: 'admin@example.com',
    passwordHash: '$2b$12$hash',
    activo: true,
    tokenVersion: 0,
    roles: [{ nombre: Role.ADMIN_SISTEMA }, { nombre: Role.CONTABILIDAD }],
  } as Usuario;

  beforeEach(() => {
    queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      increment: jest.fn(),
      findOne: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    service = new AuthService(
      repository as unknown as Repository<Usuario>,
      jwtService as unknown as JwtService,
    );
    jest.clearAllMocks();
  });

  it('validates credentials and issues a token with the account roles', async () => {
    queryBuilder.getOne.mockResolvedValue(user);
    (compare as jest.Mock).mockResolvedValue(true);
    const dto: LoginDto = { correo: ' ADMIN@example.com ', contrasena: 'secret' };

    await expect(service.login(dto)).resolves.toEqual({
      accessToken: 'signed.jwt.token',
      tokenType: 'Bearer',
      user: {
        id: 'user-1',
        correo: 'admin@example.com',
        roles: [Role.ADMIN_SISTEMA, Role.CONTABILIDAD],
      },
    });
    expect(queryBuilder.where).toHaveBeenCalledWith('usuario.correo = :correo', {
      correo: 'admin@example.com',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'user-1', ver: 0 });
  });

  it('rejects unknown accounts and incorrect passwords with the same response', async () => {
    queryBuilder.getOne.mockResolvedValue(null);
    await expect(service.login({ correo: 'missing@example.com', contrasena: 'bad' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();

    queryBuilder.getOne.mockResolvedValue(user);
    (compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login({ correo: user.correo, contrasena: 'bad' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects inactive accounts', async () => {
    queryBuilder.getOne.mockResolvedValue({ ...user, activo: false });
    await expect(service.login({ correo: user.correo, contrasena: 'secret' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();
  });

  it('invalidates active tokens on logout by advancing the token version', async () => {
    repository.increment.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
    await expect(service.logout('user-1')).resolves.toEqual({
      message: 'Sesión cerrada correctamente',
    });
    expect(repository.increment).toHaveBeenCalledWith({ id: 'user-1' }, 'tokenVersion', 1);
  });

  it('returns only identity and roles from the current account', async () => {
    repository.findOne.mockResolvedValue(user);
    await expect(service.me('user-1')).resolves.toEqual({
      id: 'user-1',
      correo: 'admin@example.com',
      roles: [Role.ADMIN_SISTEMA, Role.CONTABILIDAD],
    });
  });
});
