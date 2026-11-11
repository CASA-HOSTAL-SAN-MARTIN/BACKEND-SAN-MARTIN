import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Aspirante } from '../../src/aspirantes/entities/aspirante.entity';
import { CreateAspiranteDto } from '../../src/aspirantes/dto/create-aspirante.dto';
import { AspirantesService } from '../../src/aspirantes/aspirantes.service';

describe('AspirantesService', () => {
  let service: AspirantesService;
  let repository: jest.Mocked<
    Pick<Repository<Aspirante>, 'create' | 'findOne' | 'save'>
  >;

  const createAspiranteDto: CreateAspiranteDto = {
    nombres: 'María',
    apellidos: 'Gómez',
    numeroDocumento: 'CC-123456789',
    fechaNacimiento: '2002-08-15',
    correo: 'maria.gomez@example.com',
    telefono: '3001234567',
    direccion: 'Carrera 12 # 21-45, Pereira',
    universidad: 'Universidad del Otún',
    programaAcademico: 'Ingeniería de Sistemas',
    semestre: 5,
    estratoSocioeconomico: 2,
    ingresosHogarMensuales: 1300000,
    personasACargo: 2,
    solicitaBeca: true,
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new AspirantesService(repository as unknown as Repository<Aspirante>);
  });

  it('creates an aspirante with all information groups', async () => {
    const aspirante = {
      ...createAspiranteDto,
      id: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
    } as unknown as Aspirante;
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(aspirante);
    repository.save.mockResolvedValue(aspirante);

    await expect(service.create(createAspiranteDto)).resolves.toEqual(aspirante);
    expect(repository.create).toHaveBeenCalledWith(createAspiranteDto);
    expect(repository.save).toHaveBeenCalledWith(aspirante);
  });

  it('rejects a duplicated document number on creation', async () => {
    repository.findOne.mockResolvedValue({ id: 'existing-id' } as Aspirante);

    await expect(service.create(createAspiranteDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('returns an aspirante by id', async () => {
    const aspirante = { id: 'id-1' } as Aspirante;
    repository.findOne.mockResolvedValue(aspirante);

    await expect(service.findOne('id-1')).resolves.toEqual(aspirante);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'id-1' } });
  });

  it('rejects an unknown aspirante id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('id-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates only the provided information', async () => {
    const aspirante = {
      id: 'id-1',
      ...createAspiranteDto,
    } as unknown as Aspirante;
    const update = { semestre: 6 };
    repository.findOne.mockResolvedValue(aspirante);
    repository.save.mockResolvedValue({ ...aspirante, ...update });

    await expect(service.update('id-1', update)).resolves.toMatchObject(update);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(update));
  });

  it('rejects an empty update', async () => {
    repository.findOne.mockResolvedValue({ id: 'id-1' } as Aspirante);

    await expect(service.update('id-1', {})).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
