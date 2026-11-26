import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { AuthService } from '../../src/auth/auth.service';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { Usuario } from '../../src/auth/entities/usuario.entity';
import { Role } from '../../src/common/enums/roles.enum';
import { MailService } from '../../src/auth/mail.service';
import { createHash } from 'node:crypto';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<Pick<Repository<Usuario>, 'createQueryBuilder' | 'increment' | 'findOne' | 'save'>>;
  let queryBuilder: jest.Mocked<Pick<SelectQueryBuilder<Usuario>,
    'addSelect' | 'leftJoinAndSelect' | 'where' | 'getOne'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let mailService: jest.Mocked<Pick<MailService, 'sendPasswordSetup'>>;

  const user = {
    id: 'user-1',
    correo: 'admin@example.com',
    numeroDocumento: null,
    passwordHash: '$2b$12$hash',
    passwordSetupTokenHash: null,
    passwordSetupTokenExpiresAt: null,
    solicitud: null,
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
      save: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    mailService = { sendPasswordSetup: jest.fn().mockResolvedValue(undefined) };
    service = new AuthService(
      repository as unknown as Repository<Usuario>,
      jwtService as unknown as JwtService,
      mailService as unknown as MailService,
    );
    jest.clearAllMocks();
  });

  it('validates credentials and issues a token with the account roles', async () => {
    queryBuilder.getOne.mockResolvedValue(user);
    (compare as jest.Mock).mockResolvedValue(true);
    const dto: LoginDto = { identificador: ' ADMIN@example.com ', contrasena: 'secret' };

    await expect(service.login(dto)).resolves.toEqual({
      accessToken: 'signed.jwt.token',
      tokenType: 'Bearer',
      user: {
        id: 'user-1',
        correo: 'admin@example.com',
        roles: [Role.ADMIN_SISTEMA, Role.CONTABILIDAD],
      },
    });
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'usuario.correo = :correo OR usuario.numeroDocumento = :documento',
      { correo: 'admin@example.com', documento: 'ADMIN@example.com' },
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'user-1', ver: 0 });
  });

  it('accepts a national document as the login identifier', async () => {
    queryBuilder.getOne.mockResolvedValue({ ...user, numeroDocumento: 'CC-12345' });
    (compare as jest.Mock).mockResolvedValue(true);

    await service.login({ identificador: 'CC-12345', contrasena: 'secret' });
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'usuario.correo = :correo OR usuario.numeroDocumento = :documento',
      { correo: 'CC-12345', documento: 'CC-12345' },
    );
  });

  it('rejects unknown accounts and incorrect passwords with the same response', async () => {
    queryBuilder.getOne.mockResolvedValue(null);
    await expect(service.login({ identificador: 'missing@example.com', contrasena: 'bad' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();

    queryBuilder.getOne.mockResolvedValue(user);
    (compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login({ identificador: user.correo, contrasena: 'bad' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('does not authenticate an applicant before they set a password', async () => {
    queryBuilder.getOne.mockResolvedValue({ ...user, activo: false, passwordHash: null });
    await expect(service.login({ identificador: 'CC-12345', contrasena: 'secret' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();
  });

  it('sets a password once and activates the account', async () => {
    const token = 'setup-token';
    const account = { ...user, activo: false, passwordHash: null, tokenVersion: 0 };
    repository.findOne.mockResolvedValue(account);
    (hash as jest.Mock).mockResolvedValue('$2b$12$new-hash');
    repository.save.mockImplementation(async (saved) => saved as Usuario);

    await expect(service.setPassword({ token, contrasena: 'long-valid-passphrase' }))
      .resolves.toEqual({ message: 'Contraseña configurada correctamente. Ya puedes iniciar sesión.' });
    expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        passwordSetupTokenHash: createHash('sha256').update(token).digest('hex'),
      }),
    }));
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      activo: true,
      passwordHash: '$2b$12$new-hash',
      passwordSetupTokenHash: null,
      passwordSetupTokenExpiresAt: null,
      tokenVersion: 1,
    }));
  });

  it('sends password setup links without exposing whether the account exists', async () => {
    repository.findOne.mockResolvedValue(null);
    const genericMessage = await service.requestPasswordReset({ identificador: 'missing@example.com' });
    expect(genericMessage.message).toContain('Si la cuenta existe');
    expect(mailService.sendPasswordSetup).not.toHaveBeenCalled();
  });

  it('rejects inactive accounts', async () => {
    queryBuilder.getOne.mockResolvedValue({ ...user, activo: false });
    await expect(service.login({ identificador: user.correo, contrasena: 'secret' }))
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
