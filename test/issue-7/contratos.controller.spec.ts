import { ContratosController } from '../../src/contratos/contratos.controller';
import { ContratosService } from '../../src/contratos/contratos.service';

describe('ContratosController', () => {
  it('delegates contract CRUD operations to the service', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ id: 'contract-1' }),
      findAll: jest.fn().mockResolvedValue([{ id: 'contract-1' }]),
      findOne: jest.fn().mockResolvedValue({ id: 'contract-1' }),
      update: jest.fn().mockResolvedValue({ id: 'contract-1' }),
    } as unknown as ContratosService;
    const controller = new ContratosController(service);
    const dto = { residenteId: 'resident-1', fechaInicio: '2026-01-01' };
    const update = { valorMensual: 500000 };

    await expect(controller.create(dto)).resolves.toEqual({ id: 'contract-1' });
    await expect(controller.findAll()).resolves.toEqual([{ id: 'contract-1' }]);
    await expect(controller.findOne('contract-1')).resolves.toEqual({ id: 'contract-1' });
    await expect(controller.update('contract-1', update)).resolves.toEqual({ id: 'contract-1' });
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.findAll).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith('contract-1');
    expect(service.update).toHaveBeenCalledWith('contract-1', update);
  });
});
