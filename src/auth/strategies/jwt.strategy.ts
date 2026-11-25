import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../entities/usuario.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; correo: string; roles: string[] }> {
    const usuario = await this.usuarios.findOne({
      where: { id: payload.sub },
      relations: { roles: true },
    });
    if (!usuario || !usuario.activo || usuario.tokenVersion !== payload.ver) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    return {
      id: usuario.id,
      correo: usuario.correo,
      roles: usuario.roles.map(({ nombre }) => nombre),
    };
  }
}
