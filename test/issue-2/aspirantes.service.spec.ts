import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AspiranteResponseDto } from '../../src/aspirantes/dto/aspirante-response.dto';
import { CreateAspiranteDto } from '../../src/aspirantes/dto/create-aspirante.dto';
import { UpdateAspiranteDto } from '../../src/aspirantes/dto/update-aspirante.dto';
import { Aspirante } from '../../src/aspirantes/entities/aspirante.entity';
import { AspirantesService } from '../../src/aspirantes/aspirantes.service';

describe('AspirantesService', () => {
  let service: AspirantesService;
  let repository: jest.Mocked<
    Pick<Repository<Aspirante>, 'create' | 'findOne' | 'save'>
  >;

  const dto: CreateAspiranteDto = {
    nombreCompleto: 'María Gómez',
    numDoc: 'CC-123456789',
    programa: 'Ingeniería de Sistemas',
    promedio: 4.2,
    edad: 17,
  };

  const createAspirante = (
    overrides: Partial<Aspirante> = {},
  ): Aspirante =>
    Object.assign(new Aspirante(), {
      id: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
      ...dto,
      ...overrides,
    });

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new AspirantesService(repository as unknown as Repository<Aspirante>);
  });

  it('creates an aspirante and calculates the minor flag from age', async () => {
    const aspirante = createAspirante();
    repository.create.mockReturnValue(aspirante);
    repository.save.mockResolvedValue(aspirante);

    await expect(service.create(dto)).resolves.toEqual<AspiranteResponseDto>({
      id: aspirante.id,
      ...dto,
      esMenorDeEdad: true,
    });
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('does not classify an aspirante aged 18 as a minor', async () => {
    const aspirante = createAspirante({ edad: 18 });
    repository.findOne.mockResolvedValue(aspirante);

    await expect(service.findOne(aspirante.id)).resolves.toMatchObject({
      edad: 18,
      esMenorDeEdad: false,
    });
  });

  it('returns an aspirante by id', async () => {
    const aspirante = createAspirante();
    repository.findOne.mockResolvedValue(aspirante);

    await expect(service.findOne(aspirante.id)).resolves.toMatchObject({
      id: aspirante.id,
      nombreCompleto: aspirante.nombreCompleto,
    });
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: aspirante.id },
    });
  });

  it('returns not found for an unknown id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('unknown-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates all profile fields for an existing aspirante', async () => {
    const aspirante = createAspirante();
    const updateDto: UpdateAspiranteDto = {
      ...dto,
      nombreCompleto: 'María Gómez Rojas',
      edad: 18,
    };
    repository.findOne.mockResolvedValue(aspirante);
    repository.save.mockImplementation(async (saved) => saved as Aspirante);

    await expect(service.update(aspirante.id, updateDto)).resolves.toMatchObject({
      nombreCompleto: updateDto.nombreCompleto,
      edad: 18,
      esMenorDeEdad: false,
    });
    expect(repository.save).toHaveBeenCalledWith(aspirante);
  });

  it('returns not found when updating an unknown id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.update('unknown-id', { ...dto }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
