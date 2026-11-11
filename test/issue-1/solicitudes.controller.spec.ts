import { SolicitudesController } from '../../src/solicitudes/solicitudes.controller';
import { SolicitudesService } from '../../src/solicitudes/solicitudes.service';

describe('SolicitudesController', () => {
  it('delegates create and query operations to the service', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ id: 'id-1' }),
      findAll: jest.fn().mockResolvedValue([{ id: 'id-1' }]),
      findOne: jest.fn().mockResolvedValue({ id: 'id-1' }),
    } as unknown as SolicitudesService;
    const controller = new SolicitudesController(service);
    const dto = {} as never;

    await expect(controller.create(dto)).resolves.toEqual({ id: 'id-1' });
    await expect(controller.findAll()).resolves.toEqual([{ id: 'id-1' }]);
    await expect(controller.findOne('id-1')).resolves.toEqual({ id: 'id-1' });
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.findAll).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('id-1');
  });
});
