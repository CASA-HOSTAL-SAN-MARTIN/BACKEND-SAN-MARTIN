import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Rol } from '../auth/entities/rol.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Role } from '../common/enums/roles.enum';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudEstadoDto } from './dto/update-solicitud-estado.dto';
import { Solicitud } from './entities/solicitud.entity';
import { EstadoSolicitud } from './enums/estado-solicitud.enum';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudesRepository: Repository<Solicitud>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  async create(
    createSolicitudDto: CreateSolicitudDto,
  ): Promise<Solicitud & { accountSetupEmailSent: boolean }> {
    const correo = createSolicitudDto.correo.trim().toLowerCase();
    const numeroDocumento = createSolicitudDto.numeroDocumento.trim();
    const created = await this.dataSource.transaction(async (manager) => {
      const solicitudes = manager.getRepository(Solicitud);
      const usuarios = manager.getRepository(Usuario);
      const existingSolicitud = await solicitudes.findOne({ where: { numeroDocumento } });
      if (existingSolicitud) {
        throw new ConflictException('Ya existe una solicitud para el documento proporcionado.');
      }
      const existingAccount = await usuarios.findOne({
        where: [{ correo }, { numeroDocumento }],
      });
      if (existingAccount) {
        throw new ConflictException('Ya existe una cuenta con el correo o documento proporcionado.');
      }

      const role = await manager.getRepository(Rol).findOne({
        where: { nombre: Role.ASPIRANTE_RESIDENTE },
      });
      if (!role) throw new InternalServerErrorException('No está configurado el rol de aspirante.');

      const solicitud = await solicitudes.save(solicitudes.create({
        ...createSolicitudDto,
        correo,
        numeroDocumento,
      }));
      const usuario = usuarios.create({
        correo,
        numeroDocumento,
        passwordHash: null,
        activo: false,
        tokenVersion: 0,
        passwordSetupTokenHash: null,
        passwordSetupTokenExpiresAt: null,
        solicitud,
        roles: [role],
      });
      await usuarios.save(usuario);
      return { solicitud, usuario };
    });

    const accountSetupEmailSent = await this.authService.sendInitialSetup(
      created.usuario.id,
      `${created.solicitud.nombres} ${created.solicitud.apellidos}`,
    );
    return { ...created.solicitud, accountSetupEmailSent };
  }

  findAll(): Promise<Solicitud[]> {
    return this.solicitudesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Solicitud> {
    const solicitud = await this.solicitudesRepository.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException(`No existe una solicitud con el identificador ${id}`);
    }
    return solicitud;
  }

  async findMine(usuarioId: string): Promise<Solicitud> {
    const usuario = await this.dataSource.getRepository(Usuario).findOne({
      where: { id: usuarioId },
      relations: { solicitud: true },
    });
    if (!usuario?.solicitud) throw new NotFoundException('Tu cuenta no tiene una solicitud asociada.');
    return usuario.solicitud;
  }

  async updateStatus(id: string, { estado }: UpdateSolicitudEstadoDto): Promise<Solicitud> {
    const solicitud = await this.findOne(id);
    if (solicitud.estado === estado) return solicitud;

    const transitions: Record<EstadoSolicitud, EstadoSolicitud[]> = {
      [EstadoSolicitud.PENDIENTE]: [EstadoSolicitud.EN_REVISION, EstadoSolicitud.CANCELADA],
      [EstadoSolicitud.EN_REVISION]: [EstadoSolicitud.APROBADA, EstadoSolicitud.RECHAZADA],
      [EstadoSolicitud.APROBADA]: [],
      [EstadoSolicitud.RECHAZADA]: [],
      [EstadoSolicitud.CANCELADA]: [],
    };
    if (!transitions[solicitud.estado].includes(estado)) {
      throw new ConflictException(`No se puede cambiar una solicitud de ${solicitud.estado} a ${estado}.`);
    }
    solicitud.estado = estado;
    return this.solicitudesRepository.save(solicitud);
  }
}
