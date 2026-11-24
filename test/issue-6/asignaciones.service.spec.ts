import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AsignacionCama } from '../../src/asignaciones/entities/asignacion-cama.entity';
import { AsignacionesService } from '../../src/asignaciones/asignaciones.service';

describe('AsignacionesService', () => {
  let service: AsignacionesService;
  let repository: jest.Mocked<
    Pick<Repository<AsignacionCama>, 'find' | 'findOne'>
  >;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    service = new AsignacionesService(
      repository as unknown as Repository<AsignacionCama>,
      { transaction: jest.fn() } as unknown as DataSource,
    );
  });

  it('returns an assignment by id and rejects unknown identifiers', async () => {
    const assignment = { id: 'assignment-1' } as AsignacionCama;
    repository.findOne.mockResolvedValue(assignment);

    await expect(service.findOne('assignment-1')).resolves.toEqual(assignment);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'assignment-1' },
    });

    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns all assignments ordered by assignment date', async () => {
    const history = [{ id: 'assignment-1' } as AsignacionCama];
    repository.find.mockResolvedValue(history);

    await expect(service.findAllHistory()).resolves.toEqual(history);
    expect(repository.find).toHaveBeenCalledWith({
      order: { fechaAsignacion: 'DESC' },
    });
  });

  it('returns the history associated with a bed', async () => {
    const history = [{ id: 'assignment-1', camaId: 'bed-1' } as AsignacionCama];
    repository.find.mockResolvedValue(history);

    await expect(service.findHistoryByBed('bed-1')).resolves.toEqual(history);
    expect(repository.find).toHaveBeenCalledWith({
      where: { camaId: 'bed-1' },
      order: { fechaAsignacion: 'DESC' },
    });
  });
});
