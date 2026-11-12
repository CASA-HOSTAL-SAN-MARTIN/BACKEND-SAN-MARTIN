import { AsignacionesController } from '../../src/asignaciones/asignaciones.controller';
import { AsignacionesService } from '../../src/asignaciones/asignaciones.service';

describe('AsignacionesController', () => {
  it('delegates assignment history queries to the service', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
      findAllHistory: jest.fn().mockResolvedValue([{ id: 'assignment-1' }]),
      findHistoryByBed: jest.fn().mockResolvedValue([{ id: 'assignment-1' }]),
    } as unknown as AsignacionesService;
    const controller = new AsignacionesController(service);
    const dto = { estudianteId: 'student-1', camaId: 'bed-1' };

    await expect(controller.create(dto)).resolves.toEqual({ id: 'assignment-1' });
    await expect(controller.findAllHistory()).resolves.toEqual([{ id: 'assignment-1' }]);
    await expect(controller.findHistoryByBed('bed-1')).resolves.toEqual([{ id: 'assignment-1' }]);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.findAllHistory).toHaveBeenCalled();
    expect(service.findHistoryByBed).toHaveBeenCalledWith('bed-1');
  });
});
