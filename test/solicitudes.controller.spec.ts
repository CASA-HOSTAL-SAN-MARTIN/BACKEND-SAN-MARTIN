import { SolicitudesController } from '../src/solicitudes/solicitudes.controller';
import { Solicitud } from '../src/solicitudes/entities/solicitud.entity';
import { SolicitudesService } from '../src/solicitudes/solicitudes.service';

describe('SolicitudesController', () => {
  it('delegates creation and queries to the service', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ id: 'id-1' }),
      findAll: jest.fn().mockResolvedValue([{ id: 'id-1' }]),
      findOne: jest.fn().mockResolvedValue({ id: 'id-1' }),
    } as unknown as SolicitudesService;
    const controller = new SolicitudesController(service);

    const dto = {
      nombres: 'María',
      apellidos: 'Gómez',
      numeroDocumento: 'CC-123456789',
      correo: 'maria.gomez@example.com',
      telefono: '3001234567',
      programaAcademico: 'Ingeniería de Sistemas',
      universidad: 'Universidad del Otún',
    };

    await expect(controller.create(dto)).resolves.toEqual({ id: 'id-1' } as Solicitud);
    await expect(controller.findAll()).resolves.toEqual([{ id: 'id-1' }]);
    await expect(controller.findOne('id-1')).resolves.toEqual({ id: 'id-1' });
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.findAll).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('id-1');
  });
});
