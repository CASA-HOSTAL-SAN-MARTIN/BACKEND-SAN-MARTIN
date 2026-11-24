import { validate } from 'class-validator';
import { CreateAsignacionCamaDto } from '../../src/asignaciones/dto/create-asignacion-cama.dto';

describe('CreateAsignacionCamaDto', () => {
  it('requires a student and a bed identifier', async () => {
    const dto = new CreateAsignacionCamaDto();

    await expect(validate(dto)).resolves.toHaveLength(2);
  });

  it('accepts valid student and bed identifiers with an optional assignment date', async () => {
    const dto = Object.assign(new CreateAsignacionCamaDto(), {
      estudianteId: 'student-1',
      camaId: 'cama-01',
      fechaAsignacion: '2026-02-01T10:00:00.000Z',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
