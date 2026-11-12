import { Repository } from 'typeorm';
import { CreateAsignacionCamaDto } from '../../src/asignaciones/dto/create-asignacion-cama.dto';
import { AsignacionCama } from '../../src/asignaciones/entities/asignacion-cama.entity';
import { AsignacionesService } from '../../src/asignaciones/asignaciones.service';

describe('AsignacionesService', () => {
  let service: AsignacionesService;
  let repository: jest.Mocked<
    Pick<Repository<AsignacionCama>, 'create' | 'find' | 'save'>
  >;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };
    service = new AsignacionesService(repository as unknown as Repository<AsignacionCama>);
  });

  it('records an assignment with its occupancy period', async () => {
    const dto: CreateAsignacionCamaDto = {
      estudianteId: 'student-1',
      camaId: 'bed-1',
      fechaAsignacion: '2026-01-10T08:00:00.000Z',
      fechaFinalizacion: '2026-06-30T18:00:00.000Z',
    };
    const assignment = { id: 'assignment-1', ...dto } as unknown as AsignacionCama;
    repository.create.mockReturnValue(assignment);
    repository.save.mockResolvedValue(assignment);

    await expect(service.create(dto)).resolves.toEqual(assignment);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      estudianteId: dto.estudianteId,
      camaId: dto.camaId,
      fechaAsignacion: new Date(dto.fechaAsignacion!),
      fechaFinalizacion: new Date(dto.fechaFinalizacion!),
    }));
    expect(repository.save).toHaveBeenCalledWith(assignment);
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
