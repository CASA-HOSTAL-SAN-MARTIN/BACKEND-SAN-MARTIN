import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAspiranteDto } from '../../src/aspirantes/dto/create-aspirante.dto';
import { UpdateAspiranteDto } from '../../src/aspirantes/dto/update-aspirante.dto';

describe('CreateAspiranteDto', () => {
  const validDto = (
    overrides: Partial<CreateAspiranteDto> = {},
  ): CreateAspiranteDto =>
    plainToInstance(CreateAspiranteDto, {
      nombreCompleto: 'María Gómez',
      numDoc: 'CC-123456789',
      programa: 'Ingeniería de Sistemas',
      promedio: 4.2,
      edad: 17,
      ...overrides,
    });

  it('accepts fields with the declared types', async () => {
    await expect(validate(validDto())).resolves.toHaveLength(0);
  });

  it('trims surrounding whitespace from valid text fields', async () => {
    const dto = validDto({
      nombreCompleto: '  María Gómez  ',
      numDoc: '  CC-123456789  ',
      programa: '  Ingeniería de Sistemas  ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.nombreCompleto).toBe('María Gómez');
    expect(dto.numDoc).toBe('CC-123456789');
    expect(dto.programa).toBe('Ingeniería de Sistemas');
  });

  it('rejects a non-integer age', async () => {
    const dto = Object.assign(validDto(), { edad: 17.5 });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'edad' })]),
    );
  });

  it('rejects a non-numeric average', async () => {
    const dto = Object.assign(validDto(), { promedio: '4.2' });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'promedio' })]),
    );
  });

  it('rejects empty required text fields', async () => {
    const dto = validDto({
      nombreCompleto: '',
      numDoc: '',
      programa: '',
    });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'nombreCompleto' }),
        expect.objectContaining({ property: 'numDoc' }),
        expect.objectContaining({ property: 'programa' }),
      ]),
    );
  });

  it('rejects text fields containing only whitespace', async () => {
    const dto = validDto({
      nombreCompleto: '   ',
      numDoc: ' \t ',
      programa: '\n ',
    });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'nombreCompleto' }),
        expect.objectContaining({ property: 'numDoc' }),
        expect.objectContaining({ property: 'programa' }),
      ]),
    );
    expect(dto.nombreCompleto).toBe('');
    expect(dto.numDoc).toBe('');
    expect(dto.programa).toBe('');
  });

  it('requires all profile fields for a PUT update', async () => {
    const dto = plainToInstance(UpdateAspiranteDto, {
      nombreCompleto: 'María Gómez',
    });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'numDoc' }),
        expect.objectContaining({ property: 'programa' }),
        expect.objectContaining({ property: 'promedio' }),
        expect.objectContaining({ property: 'edad' }),
      ]),
    );
  });

  it('applies text trimming and whitespace validation to PUT updates', async () => {
    const dto = plainToInstance(UpdateAspiranteDto, {
      nombreCompleto: '  María Gómez  ',
      numDoc: '   ',
      programa: '  Ingeniería de Sistemas  ',
      promedio: 4.2,
      edad: 17,
    });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'numDoc' })]),
    );
    expect(dto.nombreCompleto).toBe('María Gómez');
    expect(dto.numDoc).toBe('');
    expect(dto.programa).toBe('Ingeniería de Sistemas');
  });
});
