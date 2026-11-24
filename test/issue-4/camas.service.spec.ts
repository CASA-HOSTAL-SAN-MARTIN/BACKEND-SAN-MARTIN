import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AsignacionCama } from '../../src/asignaciones/entities/asignacion-cama.entity';
import { Cama } from '../../src/camas/entities/cama.entity';
import { CamasService } from '../../src/camas/camas.service';
import { EstadoCama } from '../../src/camas/enums/estado-cama.enum';

describe('CamasService', () => {
  let service: CamasService;
  let repository: jest.Mocked<
    Pick<Repository<Cama>, 'find' | 'findOne' | 'save'>
  >;
  let asignacionesRepository: jest.Mocked<
    Pick<Repository<AsignacionCama>, 'findOne'>
  >;
  let dataSource: DataSource;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    asignacionesRepository = { findOne: jest.fn() };
    const manager = {
      getRepository: jest.fn((entity: unknown) => (
        entity === Cama ? repository : asignacionesRepository
      )),
    } as unknown as EntityManager;
    dataSource = {
      transaction: jest.fn(async <T>(
        runInTransaction: (manager: EntityManager) => Promise<T>,
      ) => runInTransaction(manager)),
    } as unknown as DataSource;
    service = new CamasService(
      repository as unknown as Repository<Cama>,
      dataSource,
    );
  });

  it('returns all beds with their rooms in stable order', async () => {
    const beds = [{ id: 'cama-01' } as Cama];
    repository.find.mockResolvedValue(beds);

    await expect(service.findAll()).resolves.toEqual(beds);
    expect(repository.find).toHaveBeenCalledWith({
      relations: { habitacion: true },
      order: { id: 'ASC' },
    });
  });

  it('filters beds by state for availability queries', async () => {
    const beds = [{ id: 'cama-01', estado: EstadoCama.DISPONIBLE } as Cama];
    repository.find.mockResolvedValue(beds);

    await expect(service.findAll(EstadoCama.DISPONIBLE)).resolves.toEqual(beds);
    expect(repository.find).toHaveBeenCalledWith({
      where: { estado: EstadoCama.DISPONIBLE },
      relations: { habitacion: true },
      order: { id: 'ASC' },
    });
  });

  it('returns a bed with its room and reports unknown identifiers', async () => {
    const bed = { id: 'cama-01', habitacionId: 'habitacion-01' } as Cama;
    repository.findOne.mockResolvedValue(bed);
    await expect(service.findOne('cama-01')).resolves.toEqual(bed);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'cama-01' },
      relations: { habitacion: true },
    });

    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates and persists a bed state', async () => {
    const bed = { id: 'cama-01', estado: EstadoCama.DISPONIBLE } as Cama;
    repository.findOne.mockResolvedValue(bed);
    repository.save.mockResolvedValue({ ...bed, estado: EstadoCama.OCUPADO });
    asignacionesRepository.findOne.mockResolvedValue(null);

    await expect(service.updateState('cama-01', EstadoCama.OCUPADO)).resolves.toEqual({
      ...bed,
      estado: EstadoCama.OCUPADO,
    });
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'cama-01' },
      relations: { habitacion: true },
      lock: { mode: 'pessimistic_write' },
    });
    expect(repository.save).toHaveBeenCalledWith({
      ...bed,
      estado: EstadoCama.OCUPADO,
    });
  });

  it('does not make a bed with an active assignment available', async () => {
    const bed = { id: 'cama-01', estado: EstadoCama.OCUPADO } as Cama;
    repository.findOne.mockResolvedValue(bed);
    asignacionesRepository.findOne.mockResolvedValue({
      id: 'assignment-1',
      camaId: 'cama-01',
      fechaFinalizacion: null,
    } as AsignacionCama);

    await expect(
      service.updateState('cama-01', EstadoCama.DISPONIBLE),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
