import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateEntradaListaEsperaDto } from '../../src/lista-espera/dto/create-entrada-lista-espera.dto';
import { EstadoListaEspera } from '../../src/lista-espera/enums/estado-lista-espera.enum';
import { EntradaListaEspera } from '../../src/lista-espera/entities/entrada-lista-espera.entity';
import { ListaEsperaService } from '../../src/lista-espera/lista-espera.service';

describe('ListaEsperaService', () => {
  let service: ListaEsperaService;
  let repository: jest.Mocked<
    Pick<Repository<EntradaListaEspera>, 'create' | 'find' | 'findOne' | 'save'>
  >;

  const aspiranteId = 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb';
  const createDto: CreateEntradaListaEsperaDto = { aspiranteId };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new ListaEsperaService(
      repository as unknown as Repository<EntradaListaEspera>,
    );
  });

  it('lists centralized entries in waiting order', async () => {
    const entries = [{ id: 'entry-1', aspiranteId, estado: EstadoListaEspera.PENDIENTE } as EntradaListaEspera];
    repository.find.mockResolvedValue(entries);

    await expect(service.findAll()).resolves.toEqual(entries);
    expect(repository.find).toHaveBeenCalledWith({
      order: { createdAt: 'ASC' },
    });
  });

  it('returns a specific entry by id', async () => {
    const entry = { id: 'entry-1', aspiranteId, estado: EstadoListaEspera.PENDIENTE } as EntradaListaEspera;
    repository.findOne.mockResolvedValue(entry);

    await expect(service.findOne('entry-1')).resolves.toEqual(entry);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'entry-1' } });
  });

  it('throws NotFoundException when querying a non-existent entry by id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('non-existent')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('adds an aspirant to the waiting list with default pending status', async () => {
    const entry = {
      id: 'entry-1',
      aspiranteId,
      estado: EstadoListaEspera.PENDIENTE,
    } as EntradaListaEspera;
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(entry);
    repository.save.mockResolvedValue(entry);

    await expect(service.create(createDto)).resolves.toEqual(entry);
    expect(repository.create).toHaveBeenCalledWith({ aspiranteId });
    expect(repository.save).toHaveBeenCalledWith(entry);
  });

  it('rejects adding an aspirant who is already in the waiting list', async () => {
    repository.findOne.mockResolvedValue({ id: 'existing-entry' } as EntradaListaEspera);

    await expect(service.create(createDto)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('updates the status of an existing waiting list entry', async () => {
    const entry = {
      id: 'entry-1',
      aspiranteId,
      estado: EstadoListaEspera.PENDIENTE,
    } as EntradaListaEspera;
    repository.findOne.mockResolvedValue(entry);
    repository.save.mockResolvedValue({
      ...entry,
      estado: EstadoListaEspera.ASIGNADO,
    });

    await expect(
      service.update('entry-1', { estado: EstadoListaEspera.ASIGNADO }),
    ).resolves.toMatchObject({ estado: EstadoListaEspera.ASIGNADO });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ estado: EstadoListaEspera.ASIGNADO }),
    );
  });

  it('rejects updating an unknown waiting list entry', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.update('unknown-id', { estado: EstadoListaEspera.RETIRADO }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
