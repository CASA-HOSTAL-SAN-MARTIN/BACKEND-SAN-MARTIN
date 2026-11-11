import { ListaEsperaController } from '../../src/lista-espera/lista-espera.controller';
import { ListaEsperaService } from '../../src/lista-espera/lista-espera.service';
import { EstadoListaEspera } from '../../src/lista-espera/enums/estado-lista-espera.enum';

describe('ListaEsperaController', () => {
  it('delegates list, find, create, and status update operations to the service', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([{ id: 'entry-1' }]),
      findOne: jest.fn().mockResolvedValue({ id: 'entry-1' }),
      create: jest.fn().mockResolvedValue({ id: 'entry-1' }),
      update: jest.fn().mockResolvedValue({ id: 'entry-1', estado: EstadoListaEspera.ASIGNADO }),
    } as unknown as ListaEsperaService;
    const controller = new ListaEsperaController(service);
    const createDto = { aspiranteId: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb' };
    const updateDto = { estado: EstadoListaEspera.ASIGNADO };

    await expect(controller.findAll()).resolves.toEqual([{ id: 'entry-1' }]);
    await expect(controller.findOne('entry-1')).resolves.toEqual({ id: 'entry-1' });
    await expect(controller.create(createDto)).resolves.toEqual({ id: 'entry-1' });
    await expect(controller.update('entry-1', updateDto)).resolves.toEqual({
      id: 'entry-1',
      estado: EstadoListaEspera.ASIGNADO,
    });
    expect(service.findAll).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('entry-1');
    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(service.update).toHaveBeenCalledWith('entry-1', updateDto);
  });
});
