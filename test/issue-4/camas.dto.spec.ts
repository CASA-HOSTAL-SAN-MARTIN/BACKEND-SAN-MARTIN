import { validate } from 'class-validator';
import { FindCamasDto } from '../../src/camas/dto/find-camas.dto';
import { UpdateEstadoCamaDto } from '../../src/camas/dto/update-estado-cama.dto';
import { EstadoCama } from '../../src/camas/enums/estado-cama.enum';

describe('Cama DTOs', () => {
  it.each(Object.values(EstadoCama))('accepts the %s state', async (estado) => {
    const updateDto = Object.assign(new UpdateEstadoCamaDto(), { estado });
    const queryDto = Object.assign(new FindCamasDto(), { estado });

    await expect(validate(updateDto)).resolves.toHaveLength(0);
    await expect(validate(queryDto)).resolves.toHaveLength(0);
  });

  it('rejects unknown state values for updates and availability queries', async () => {
    const updateDto = Object.assign(new UpdateEstadoCamaDto(), { estado: 'reservado' });
    const queryDto = Object.assign(new FindCamasDto(), { estado: 'reservado' });

    await expect(validate(updateDto)).resolves.not.toHaveLength(0);
    await expect(validate(queryDto)).resolves.not.toHaveLength(0);
  });
});
