import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MoreThan, Repository } from 'typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Usuario } from './entities/usuario.entity';
import { SetPasswordDto } from './dto/set-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { MailService } from './mail.service';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; tokenType: 'Bearer'; user: {
    id: string;
    correo: string;
    roles: string[];
  } }> {
    const identificador = dto.identificador.trim();
    const correo = identificador.includes('@') ? identificador.toLowerCase() : identificador;
    const usuario = await this.usuarios.createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .leftJoinAndSelect('usuario.roles', 'rol')
      .where('usuario.correo = :correo OR usuario.numeroDocumento = :documento', {
        correo,
        documento: identificador,
      })
      .getOne();

    if (
      !usuario || !usuario.activo || !usuario.passwordHash ||
      !(await compare(dto.contrasena, usuario.passwordHash))
    ) {
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

  async sendApplicationReceived(email: string, name: string, radicado: string): Promise<boolean> {
    try {
      await this.mailService.sendApplicationReceived(email, name, radicado);
      return true;
    } catch {
      this.logger.warn('No se pudo enviar la confirmación de recepción de solicitud.');
      return false;
    }
  }

  async sendApprovedApplicantSetup(solicitud: Solicitud): Promise<boolean> {
    const usuario = await this.usuarios.findOne({ where: { solicitud: { id: solicitud.id } } });
    if (!usuario) return false;
    return this.sendPasswordSetup(usuario, `${solicitud.nombres} ${solicitud.apellidos}`, true);
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ message: string }> {
    const identificador = dto.identificador.trim();
    const correo = identificador.includes('@') ? identificador.toLowerCase() : identificador;
    const usuario = await this.usuarios.findOne({
      where: [{ correo }, { numeroDocumento: identificador }],
      relations: { solicitud: true },
    });
    if (usuario && (!usuario.solicitud || usuario.solicitud.estado === 'aprobada')) {
      const name = usuario.solicitud
        ? `${usuario.solicitud.nombres} ${usuario.solicitud.apellidos}`
        : usuario.correo;
      await this.sendPasswordSetup(usuario, name);
    }
    return { message: 'Si la cuenta existe, recibirás un enlace para configurar la contraseña.' };
  }

  async setPassword(dto: SetPasswordDto): Promise<{ message: string }> {
    if (Buffer.byteLength(dto.contrasena, 'utf8') > 72) {
      throw new UnauthorizedException('El enlace o la contraseña no son válidos');
    }
    const tokenHash = this.hashToken(dto.token);
    const usuario = await this.usuarios.findOne({
      where: {
        passwordSetupTokenHash: tokenHash,
        passwordSetupTokenExpiresAt: MoreThan(new Date()),
      },
      relations: { solicitud: true },
    });
    if (!usuario) throw new UnauthorizedException('El enlace expiró o ya fue utilizado');
    if (usuario.solicitud && usuario.solicitud.estado !== 'aprobada') {
      throw new UnauthorizedException('La solicitud aún no ha sido aprobada.');
    }

    usuario.passwordHash = await hash(dto.contrasena, 12);
    usuario.passwordSetupTokenHash = null;
    usuario.passwordSetupTokenExpiresAt = null;
    usuario.activo = true;
    usuario.tokenVersion += 1;
    await this.usuarios.save(usuario);
    return { message: 'Contraseña configurada correctamente. Ya puedes iniciar sesión.' };
  }

  private async sendPasswordSetup(usuario: Usuario, name: string, approved = false): Promise<boolean> {
    const token = randomBytes(32).toString('hex');
    usuario.passwordSetupTokenHash = this.hashToken(token);
    usuario.passwordSetupTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.usuarios.save(usuario);
    try {
      if (approved) {
        await this.mailService.sendApprovedApplicantSetup(usuario.correo, name, token);
      } else {
        await this.mailService.sendPasswordSetup(usuario.correo, name, token);
      }
      return true;
    } catch {
      usuario.passwordSetupTokenHash = null;
      usuario.passwordSetupTokenExpiresAt = null;
      await this.usuarios.save(usuario);
      this.logger.warn('No se pudo enviar un enlace de configuración de contraseña.');
      return false;
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
