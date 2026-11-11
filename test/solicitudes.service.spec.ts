import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateSolicitudDto } from '../src/solicitudes/dto/create-solicitud.dto';
import { EstadoSolicitud } from '../src/solicitudes/enums/estado-solicitud.enum';
import { Solicitud } from '../src/solicitudes/entities/solicitud.entity';
import { SolicitudesService } from '../src/solicitudes/solicitudes.service';

describe('SolicitudesService', () => {
  let service: SolicitudesService;
  let repository: jest.Mocked<
    Pick<Repository<Solicitud>, 'create' | 'find' | 'findOne' | 'save'>
  >;

  const createSolicitudDto: CreateSolicitudDto = {
    nombres: 'María',
    apellidos: 'Gómez',
    numeroDocumento: 'CC-123456789',
    correo: 'maria.gomez@example.com',
    telefono: '3001234567',
    programaAcademico: 'Ingeniería de Sistemas',
    universidad: 'Universidad del Otún',
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new SolicitudesService(repository as unknown as Repository<Solicitud>);
  });

  it('creates a solicitud with a pending status', async () => {
    const solicitud = {
      ...createSolicitudDto,
      id: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
      estado: EstadoSolicitud.PENDIENTE,
    } as Solicitud;
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(solicitud);
    repository.save.mockResolvedValue(solicitud);

    await expect(service.create(createSolicitudDto)).resolves.toEqual(solicitud);
    expect(repository.create).toHaveBeenCalledWith(createSolicitudDto);
    expect(repository.save).toHaveBeenCalledWith(solicitud);
  });

  it('rejects a duplicated document number', async () => {
    repository.findOne.mockResolvedValue({ id: 'existing-id' } as Solicitud);

    await expect(service.create(createSolicitudDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('returns solicitudes ordered by creation date', async () => {
    const solicitudes = [{ id: 'id-1' } as Solicitud];
    repository.find.mockResolvedValue(solicitudes);

    await expect(service.findAll()).resolves.toEqual(solicitudes);
    expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('returns a solicitud by id', async () => {
    const solicitud = { id: 'id-1' } as Solicitud;
    repository.findOne.mockResolvedValue(solicitud);

    await expect(service.findOne('id-1')).resolves.toEqual(solicitud);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'id-1' } });
  });

  it('returns not found for an unknown id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('id-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
