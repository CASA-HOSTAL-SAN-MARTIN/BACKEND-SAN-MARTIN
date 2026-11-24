import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cama } from '../../src/camas/entities/cama.entity';
import { CamasService } from '../../src/camas/camas.service';
import { EstadoCama } from '../../src/camas/enums/estado-cama.enum';

describe('CamasService', () => {
  let service: CamasService;
  let repository: jest.Mocked<
    Pick<Repository<Cama>, 'find' | 'findOne' | 'save'>
  >;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new CamasService(repository as unknown as Repository<Cama>);
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

    await expect(service.updateState('cama-01', EstadoCama.OCUPADO)).resolves.toEqual({
      ...bed,
      estado: EstadoCama.OCUPADO,
    });
    expect(repository.save).toHaveBeenCalledWith({
      ...bed,
      estado: EstadoCama.OCUPADO,
    });
  });
});
