import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Aspirante } from '../../src/aspirantes/entities/aspirante.entity';
import { CreateEntradaListaEsperaDto } from '../../src/lista-espera/dto/create-entrada-lista-espera.dto';
import { EstadoListaEspera } from '../../src/lista-espera/enums/estado-lista-espera.enum';
import { EntradaListaEspera } from '../../src/lista-espera/entities/entrada-lista-espera.entity';
import { ListaEsperaService } from '../../src/lista-espera/lista-espera.service';

describe('ListaEsperaService', () => {
  let service: ListaEsperaService;
  let listaRepository: jest.Mocked<
    Pick<Repository<EntradaListaEspera>, 'create' | 'find' | 'findOne' | 'save'>
  >;
  let aspirantesRepository: jest.Mocked<Pick<Repository<Aspirante>, 'findOne'>>;

  const aspiranteId = 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb';
  const createDto: CreateEntradaListaEsperaDto = { aspiranteId };

  beforeEach(() => {
    listaRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    aspirantesRepository = { findOne: jest.fn() };
    service = new ListaEsperaService(
      listaRepository as unknown as Repository<EntradaListaEspera>,
      aspirantesRepository as unknown as Repository<Aspirante>,
    );
  });

  it('lists centralized entries with their aspirants', async () => {
    const entries = [{ id: 'entry-1' } as EntradaListaEspera];
    listaRepository.find.mockResolvedValue(entries);

    await expect(service.findAll()).resolves.toEqual(entries);
    expect(listaRepository.find).toHaveBeenCalledWith({
      relations: { aspirante: true },
      order: { createdAt: 'ASC' },
    });
  });

  it('adds an existing aspirante with pending status', async () => {
    const aspirante = { id: aspiranteId } as Aspirante;
    const entry = { id: 'entry-1', aspiranteId, aspirante } as EntradaListaEspera;
    aspirantesRepository.findOne.mockResolvedValue(aspirante);
    listaRepository.findOne.mockResolvedValue(null);
    listaRepository.create.mockReturnValue(entry);
    listaRepository.save.mockResolvedValue(entry);

    await expect(service.create(createDto)).resolves.toEqual(entry);
    expect(listaRepository.create).toHaveBeenCalledWith({ aspiranteId, aspirante });
    expect(listaRepository.save).toHaveBeenCalledWith(entry);
  });

  it('rejects an unknown aspirante', async () => {
    aspirantesRepository.findOne.mockResolvedValue(null);

    await expect(service.create(createDto)).rejects.toBeInstanceOf(NotFoundException);
    expect(listaRepository.create).not.toHaveBeenCalled();
  });

  it('rejects an aspirante already in the waiting list', async () => {
    aspirantesRepository.findOne.mockResolvedValue({ id: aspiranteId } as Aspirante);
    listaRepository.findOne.mockResolvedValue({ id: 'entry-1' } as EntradaListaEspera);

    await expect(service.create(createDto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates the entry status', async () => {
    const entry = { id: 'entry-1', estado: EstadoListaEspera.PENDIENTE } as EntradaListaEspera;
    listaRepository.findOne.mockResolvedValue(entry);
    listaRepository.save.mockResolvedValue({
      ...entry,
      estado: EstadoListaEspera.ASIGNADO,
    });

    await expect(
      service.update('entry-1', { estado: EstadoListaEspera.ASIGNADO }),
    ).resolves.toMatchObject({ estado: EstadoListaEspera.ASIGNADO });
    expect(listaRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ estado: EstadoListaEspera.ASIGNADO }),
    );
  });

  it('rejects an unknown waiting-list entry', async () => {
    listaRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('entry-1', { estado: EstadoListaEspera.RETIRADO }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
