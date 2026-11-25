import { BadRequestException, ConflictException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { Rol } from '../../src/auth/entities/rol.entity';
import { Usuario } from '../../src/auth/entities/usuario.entity';
import { Role } from '../../src/common/enums/roles.enum';
import { CreateUsuarioDto } from '../../src/usuarios/dto/create-usuario.dto';
import { UsuariosService } from '../../src/usuarios/usuarios.service';

jest.mock('bcrypt', () => ({ hash: jest.fn() }));

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarios: jest.Mocked<Pick<Repository<Usuario>, 'create' | 'save'>>;
  let roles: jest.Mocked<Pick<Repository<Rol>, 'findBy'>>;

  const dto: CreateUsuarioDto = {
    correo: 'persona@example.com',
    contrasena: 'una-clave-segura',
    roles: [Role.CONTABILIDAD, Role.ADMIN_FUNDACION],
  };

  beforeEach(() => {
    usuarios = { create: jest.fn(), save: jest.fn() };
    roles = { findBy: jest.fn() };
    service = new UsuariosService(
      usuarios as unknown as Repository<Usuario>,
      roles as unknown as Repository<Rol>,
    );
    jest.clearAllMocks();
    (hash as jest.Mock).mockResolvedValue('$2b$12$hashed-password');
  });

  it('hashes the password, associates multiple roles and omits the hash from its response', async () => {
    const assignedRoles = dto.roles.map((nombre) => ({ nombre }) as Rol);
    const created = {
      id: 'user-1',
      correo: dto.correo,
      activo: true,
      passwordHash: '$2b$12$hashed-password',
      roles: assignedRoles,
    } as Usuario;
    roles.findBy.mockResolvedValue(assignedRoles);
    usuarios.create.mockReturnValue(created);
    usuarios.save.mockResolvedValue(created);

    await expect(service.create(dto)).resolves.toEqual({
      id: 'user-1',
      correo: dto.correo,
      roles: dto.roles,
      activo: true,
    });
    expect(hash).toHaveBeenCalledWith(dto.contrasena, 12);
    expect(usuarios.create).toHaveBeenCalledWith(expect.objectContaining({
      passwordHash: '$2b$12$hashed-password',
      roles: assignedRoles,
    }));
  });

  it('rejects a password that bcrypt would truncate', async () => {
    await expect(service.create({ ...dto, contrasena: 'á'.repeat(37) }))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(roles.findBy).not.toHaveBeenCalled();
  });

  it('rejects roles that are not present in the database', async () => {
    roles.findBy.mockResolvedValue([{ nombre: Role.CONTABILIDAD } as Rol]);
    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(usuarios.save).not.toHaveBeenCalled();
  });

  it('returns a conflict for a duplicate email', async () => {
    const assignedRoles = dto.roles.map((nombre) => ({ nombre }) as Rol);
    roles.findBy.mockResolvedValue(assignedRoles);
    usuarios.create.mockReturnValue({ roles: assignedRoles } as Usuario);
    usuarios.save.mockRejectedValue(new QueryFailedError(
      'INSERT',
      [],
      Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' }),
    ));

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });
});
