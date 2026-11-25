import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; tokenType: 'Bearer'; user: {
    id: string;
    correo: string;
    roles: string[];
  } }> {
    const correo = dto.correo.trim().toLowerCase();
    const usuario = await this.usuarios.createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .leftJoinAndSelect('usuario.roles', 'rol')
      .where('usuario.correo = :correo', { correo })
      .getOne();

    if (!usuario || !usuario.activo || !(await compare(dto.contrasena, usuario.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas o cuenta inactiva');
    }

    const payload: JwtPayload = { sub: usuario.id, ver: usuario.tokenVersion };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: usuario.id,
        correo: usuario.correo,
        roles: usuario.roles.map(({ nombre }) => nombre),
      },
    };
  }

  async logout(usuarioId: string): Promise<{ message: string }> {
    await this.usuarios.increment({ id: usuarioId }, 'tokenVersion', 1);
    return { message: 'Sesión cerrada correctamente' };
  }

  async me(usuarioId: string): Promise<{ id: string; correo: string; roles: string[] }> {
    const usuario = await this.usuarios.findOne({
      where: { id: usuarioId },
      relations: { roles: true },
    });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    return {
      id: usuario.id,
      correo: usuario.correo,
      roles: usuario.roles.map(({ nombre }) => nombre),
    };
  }
}
