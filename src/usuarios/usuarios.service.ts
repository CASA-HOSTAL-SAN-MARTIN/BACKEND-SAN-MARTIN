import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../common/enums/roles.enum';
import { Rol } from '../auth/entities/rol.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Rol) private readonly roles: Repository<Rol>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<{
    id: string;
    correo: string;
    roles: Role[];
    activo: boolean;
  }> {
    if (Buffer.byteLength(dto.contrasena, 'utf8') > 72) {
      throw new BadRequestException('La contraseña no puede superar 72 bytes');
    }

    const roles = await this.roles.findBy(dto.roles.map((nombre) => ({ nombre })));
    if (roles.length !== dto.roles.length) {
      throw new BadRequestException('Uno o más roles no están configurados en la base de datos');
    }

    const usuario = this.usuarios.create({
      correo: dto.correo.trim().toLowerCase(),
      passwordHash: await hash(dto.contrasena, 12),
      roles,
    });

    try {
      const created = await this.usuarios.save(usuario);
      return {
        id: created.id,
        correo: created.correo,
        roles: created.roles.map(({ nombre }) => nombre),
        activo: created.activo,
      };
    } catch (error) {
      const driverError = error instanceof QueryFailedError
        ? error.driverError as { code?: string }
        : undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }
      throw error;
    }
  }
}
