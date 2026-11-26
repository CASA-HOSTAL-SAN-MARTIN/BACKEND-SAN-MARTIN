import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../../src/auth/auth.service';
import { Rol } from '../../src/auth/entities/rol.entity';
import { Usuario } from '../../src/auth/entities/usuario.entity';
import { Role } from '../../src/common/enums/roles.enum';
import { CreateSolicitudDto } from '../../src/solicitudes/dto/create-solicitud.dto';
import { UpdateSolicitudEstadoDto } from '../../src/solicitudes/dto/update-solicitud-estado.dto';
import { EstadoSolicitud } from '../../src/solicitudes/enums/estado-solicitud.enum';
import { Solicitud } from '../../src/solicitudes/entities/solicitud.entity';
import { SolicitudesService } from '../../src/solicitudes/solicitudes.service';

describe('SolicitudesService', () => {
  let service: SolicitudesService;
  let repository: jest.Mocked<Pick<Repository<Solicitud>, 'find' | 'findOne' | 'save'>>;
  let solicitudTx: jest.Mocked<Pick<Repository<Solicitud>, 'findOne' | 'create' | 'save'>>;
  let usuarioTx: jest.Mocked<Pick<Repository<Usuario>, 'findOne' | 'create' | 'save'>>;
  let rolesTx: jest.Mocked<Pick<Repository<Rol>, 'findOne'>>;
  let usuarioRepository: jest.Mocked<Pick<Repository<Usuario>, 'findOne'>>;
  let authService: jest.Mocked<Pick<AuthService, 'sendInitialSetup'>>;

  const dto: CreateSolicitudDto = {
    nombres: 'María',
    apellidos: 'Gómez',
    numeroDocumento: 'CC-123456789',
    correo: 'maria.gomez@example.com',
    telefono: '3001234567',
    programaAcademico: 'Ingeniería de Sistemas',
    universidad: 'Universidad del Otún',
  };

  beforeEach(() => {
    const solicitud = {
      ...dto,
      id: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
      estado: EstadoSolicitud.PENDIENTE,
    } as Solicitud;
    const usuario = { id: 'user-1', solicitud, correo: dto.correo } as Usuario;
    repository = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
    solicitudTx = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(solicitud),
      save: jest.fn().mockResolvedValue(solicitud),
    };
    usuarioTx = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(usuario),
      save: jest.fn().mockResolvedValue(usuario),
    };
    rolesTx = { findOne: jest.fn().mockResolvedValue({ nombre: Role.ASPIRANTE_RESIDENTE } as Rol) };
    usuarioRepository = { findOne: jest.fn() };
    const manager = {
      getRepository: (entity: unknown) => {
        if (entity === Solicitud) return solicitudTx;
        if (entity === Usuario) return usuarioTx;
        return rolesTx;
      },
    };
    const dataSource = {
      transaction: jest.fn(async (operation: (value: typeof manager) => unknown) => operation(manager)),
      getRepository: jest.fn().mockReturnValue(usuarioRepository),
    };
    authService = { sendInitialSetup: jest.fn().mockResolvedValue(true) };
    service = new SolicitudesService(
      repository as unknown as Repository<Solicitud>,
      dataSource as unknown as DataSource,
      authService as unknown as AuthService,
    );
  });

  it('creates a request and a linked aspirant account transactionally, then emails setup access', async () => {
    await expect(service.create(dto)).resolves.toMatchObject({
      id: expect.any(String),
      estado: EstadoSolicitud.PENDIENTE,
      accountSetupEmailSent: true,
    });
    expect(usuarioTx.create).toHaveBeenCalledWith(expect.objectContaining({
      correo: dto.correo,
      numeroDocumento: dto.numeroDocumento,
      passwordHash: null,
      activo: false,
      roles: [expect.objectContaining({ nombre: Role.ASPIRANTE_RESIDENTE })],
    }));
    expect(authService.sendInitialSetup).toHaveBeenCalledWith('user-1', 'María Gómez');
  });

  it('does not create an account for a duplicate document', async () => {
    solicitudTx.findOne.mockResolvedValue({ id: 'existing-id' } as Solicitud);
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(usuarioTx.save).not.toHaveBeenCalled();
  });

  it('returns all requests ordered by creation date', async () => {
    const solicitudes = [{ id: 'id-1' } as Solicitud];
    repository.find.mockResolvedValue(solicitudes);
    await expect(service.findAll()).resolves.toEqual(solicitudes);
    expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('returns a request by id and rejects unknown ids', async () => {
    const solicitud = { id: 'id-1' } as Solicitud;
    repository.findOne.mockResolvedValue(solicitud);
    await expect(service.findOne('id-1')).resolves.toEqual(solicitud);
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns only the request linked to the authenticated user', async () => {
    const solicitud = { id: 'own-request' } as Solicitud;
    usuarioRepository.findOne.mockResolvedValue({ solicitud } as Usuario);
    await expect(service.findMine('user-1')).resolves.toEqual(solicitud);
    expect(usuarioRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-1' }, relations: { solicitud: true },
    });
  });

  it('moves a pending request into review and then to a terminal decision', async () => {
    const solicitud = { id: 'request-1', estado: EstadoSolicitud.PENDIENTE } as Solicitud;
    repository.findOne.mockResolvedValue(solicitud);
    repository.save.mockImplementation(async (value) => value as Solicitud);
    await service.updateStatus('request-1', { estado: EstadoSolicitud.EN_REVISION });
    expect(solicitud.estado).toBe(EstadoSolicitud.EN_REVISION);
    await service.updateStatus('request-1', { estado: EstadoSolicitud.APROBADA });
    expect(solicitud.estado).toBe(EstadoSolicitud.APROBADA);
  });

  it('rejects invalid state transitions', async () => {
    repository.findOne.mockResolvedValue({ id: 'request-1', estado: EstadoSolicitud.PENDIENTE } as Solicitud);
    const update: UpdateSolicitudEstadoDto = { estado: EstadoSolicitud.APROBADA };
    await expect(service.updateStatus('request-1', update)).rejects.toBeInstanceOf(ConflictException);
  });
});
