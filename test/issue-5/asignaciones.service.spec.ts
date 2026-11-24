import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cama } from '../../src/camas/entities/cama.entity';
import { EstadoCama } from '../../src/camas/enums/estado-cama.enum';
import { CreateAsignacionCamaDto } from '../../src/asignaciones/dto/create-asignacion-cama.dto';
import { AsignacionCama } from '../../src/asignaciones/entities/asignacion-cama.entity';
import { AsignacionesService } from '../../src/asignaciones/asignaciones.service';

describe('AsignacionesService transactions', () => {
  let service: AsignacionesService;
  let camasRepository: jest.Mocked<
    Pick<Repository<Cama>, 'findOne' | 'save'>
  >;
  let asignacionesRepository: jest.Mocked<
    Pick<Repository<AsignacionCama>, 'create' | 'find' | 'findOne' | 'save'>
  >;
  let dataSource: DataSource;

  const dto: CreateAsignacionCamaDto = {
    estudianteId: 'student-1',
    camaId: 'cama-01',
    fechaAsignacion: '2026-02-01T10:00:00.000Z',
  };

  beforeEach(() => {
    camasRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    asignacionesRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) => (
        entity === Cama ? camasRepository : asignacionesRepository
      )),
    } as unknown as EntityManager;
    dataSource = {
      transaction: jest.fn(async <T>(
        runInTransaction: (manager: EntityManager) => Promise<T>,
      ) => runInTransaction(manager)),
    } as unknown as DataSource;
    service = new AsignacionesService(
      asignacionesRepository as unknown as Repository<AsignacionCama>,
      dataSource,
    );
  });

  it('locks an available bed, saves the assignment, and marks the bed occupied', async () => {
    const cama = { id: 'cama-01', estado: EstadoCama.DISPONIBLE } as Cama;
    const assignment = {
      id: 'assignment-1',
      estudianteId: dto.estudianteId,
      camaId: dto.camaId,
      fechaAsignacion: new Date(dto.fechaAsignacion!),
      fechaFinalizacion: null,
    } as AsignacionCama;
    camasRepository.findOne.mockResolvedValue(cama);
    asignacionesRepository.findOne.mockResolvedValue(null);
    asignacionesRepository.create.mockReturnValue(assignment);
    asignacionesRepository.save.mockResolvedValue(assignment);
    camasRepository.save.mockResolvedValue({
      ...cama,
      estado: EstadoCama.OCUPADO,
    });

    await expect(service.create(dto)).resolves.toEqual(assignment);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(camasRepository.findOne).toHaveBeenCalledWith({
      where: { id: dto.camaId },
      lock: { mode: 'pessimistic_write' },
    });
    expect(asignacionesRepository.findOne).toHaveBeenCalledWith({
      where: { camaId: dto.camaId, fechaFinalizacion: expect.anything() },
    });
    expect(asignacionesRepository.create).toHaveBeenCalledWith({
      estudianteId: dto.estudianteId,
      camaId: dto.camaId,
      fechaAsignacion: new Date(dto.fechaAsignacion!),
      fechaFinalizacion: null,
    });
    expect(asignacionesRepository.save).toHaveBeenCalledWith(assignment);
    expect(camasRepository.save).toHaveBeenCalledWith({
      ...cama,
      estado: EstadoCama.OCUPADO,
    });
  });

  it.each([EstadoCama.OCUPADO, EstadoCama.BLOQUEADO])(
    'rejects a bed whose state is %s',
    async (estado) => {
      camasRepository.findOne.mockResolvedValue({
        id: dto.camaId,
        estado,
      } as Cama);
      asignacionesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
      expect(asignacionesRepository.save).not.toHaveBeenCalled();
      expect(camasRepository.save).not.toHaveBeenCalled();
    },
  );

  it('rejects a nominally available bed that already has an active assignment', async () => {
    camasRepository.findOne.mockResolvedValue({
      id: dto.camaId,
      estado: EstadoCama.DISPONIBLE,
    } as Cama);
    asignacionesRepository.findOne.mockResolvedValue({
      id: 'existing-assignment',
      camaId: dto.camaId,
      fechaFinalizacion: null,
    } as AsignacionCama);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(asignacionesRepository.save).not.toHaveBeenCalled();
    expect(camasRepository.save).not.toHaveBeenCalled();
  });

  it('reports an unknown bed without attempting to create an assignment', async () => {
    camasRepository.findOne.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(asignacionesRepository.findOne).not.toHaveBeenCalled();
    expect(asignacionesRepository.save).not.toHaveBeenCalled();
  });

  it('propagates persistence errors so the transaction can roll back', async () => {
    const persistenceError = new Error('bed update failed');
    camasRepository.findOne.mockResolvedValue({
      id: dto.camaId,
      estado: EstadoCama.DISPONIBLE,
    } as Cama);
    asignacionesRepository.findOne.mockResolvedValue(null);
    asignacionesRepository.create.mockReturnValue({ id: 'assignment-1' } as AsignacionCama);
    asignacionesRepository.save.mockResolvedValue({ id: 'assignment-1' } as AsignacionCama);
    camasRepository.save.mockRejectedValue(persistenceError);

    await expect(service.create(dto)).rejects.toBe(persistenceError);
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
  });
});
