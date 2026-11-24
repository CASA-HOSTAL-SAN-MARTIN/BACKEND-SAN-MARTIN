import { AsignacionesController } from '../../src/asignaciones/asignaciones.controller';
import { AsignacionesService } from '../../src/asignaciones/asignaciones.service';

describe('Issue 5 assignment endpoints', () => {
  it('delegates assignment creation and lookup to the service', async () => {
    const assignment = { id: 'assignment-1', camaId: 'cama-01' };
    const service = {
      create: jest.fn().mockResolvedValue(assignment),
      findOne: jest.fn().mockResolvedValue(assignment),
    } as unknown as AsignacionesService;
    const controller = new AsignacionesController(service);
    const dto = { estudianteId: 'student-1', camaId: 'cama-01' };

    await expect(controller.create(dto)).resolves.toEqual(assignment);
    await expect(controller.findOne('assignment-1')).resolves.toEqual(assignment);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.findOne).toHaveBeenCalledWith('assignment-1');
  });
});
