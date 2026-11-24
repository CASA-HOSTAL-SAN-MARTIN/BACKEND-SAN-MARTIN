import { CamasController } from '../../src/camas/camas.controller';
import { CamasService } from '../../src/camas/camas.service';
import { EstadoCama } from '../../src/camas/enums/estado-cama.enum';

describe('CamasController', () => {
  it('delegates list, detail, and state updates to the service', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([{ id: 'cama-01' }]),
      findOne: jest.fn().mockResolvedValue({ id: 'cama-01' }),
      updateState: jest.fn().mockResolvedValue({
        id: 'cama-01',
        estado: EstadoCama.BLOQUEADO,
      }),
    } as unknown as CamasService;
    const controller = new CamasController(service);

    await expect(controller.findAll({})).resolves.toEqual([{ id: 'cama-01' }]);
    await expect(controller.findAll({ estado: EstadoCama.DISPONIBLE })).resolves.toEqual([
      { id: 'cama-01' },
    ]);
    await expect(controller.findOne('cama-01')).resolves.toEqual({ id: 'cama-01' });
    await expect(controller.updateState('cama-01', {
      estado: EstadoCama.BLOQUEADO,
    })).resolves.toEqual({ id: 'cama-01', estado: EstadoCama.BLOQUEADO });

    expect(service.findAll).toHaveBeenNthCalledWith(1, undefined);
    expect(service.findAll).toHaveBeenNthCalledWith(2, EstadoCama.DISPONIBLE);
    expect(service.findOne).toHaveBeenCalledWith('cama-01');
    expect(service.updateState).toHaveBeenCalledWith('cama-01', EstadoCama.BLOQUEADO);
  });
});
