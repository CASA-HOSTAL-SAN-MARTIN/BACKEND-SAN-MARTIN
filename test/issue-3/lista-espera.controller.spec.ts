import { ListaEsperaController } from '../../src/lista-espera/lista-espera.controller';
import { ListaEsperaService } from '../../src/lista-espera/lista-espera.service';

describe('ListaEsperaController', () => {
  it('delegates list, create, and status update operations', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([{ id: 'entry-1' }]),
      create: jest.fn().mockResolvedValue({ id: 'entry-1' }),
      update: jest.fn().mockResolvedValue({ id: 'entry-1', estado: 'asignado' }),
    } as unknown as ListaEsperaService;
    const controller = new ListaEsperaController(service);
    const createDto = { aspiranteId: 'aspirante-1' };
    const updateDto = { estado: 'asignado' } as never;

    await expect(controller.findAll()).resolves.toEqual([{ id: 'entry-1' }]);
    await expect(controller.create(createDto)).resolves.toEqual({ id: 'entry-1' });
    await expect(controller.update('entry-1', updateDto)).resolves.toEqual({
      id: 'entry-1',
      estado: 'asignado',
    });
    expect(service.findAll).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(service.update).toHaveBeenCalledWith('entry-1', updateDto);
  });
});
