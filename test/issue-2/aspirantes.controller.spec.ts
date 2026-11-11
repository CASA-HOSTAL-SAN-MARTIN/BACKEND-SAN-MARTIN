import { AspirantesController } from '../../src/aspirantes/aspirantes.controller';
import { CreateAspiranteDto } from '../../src/aspirantes/dto/create-aspirante.dto';
import { UpdateAspiranteDto } from '../../src/aspirantes/dto/update-aspirante.dto';
import { AspirantesService } from '../../src/aspirantes/aspirantes.service';

describe('AspirantesController', () => {
  it('delegates creation, lookup, and update to the service', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({ id: 'id-1' }),
      findOne: jest.fn().mockResolvedValue({ id: 'id-1' }),
      update: jest.fn().mockResolvedValue({ id: 'id-1', semestre: 6 }),
    } as unknown as AspirantesService;
    const controller = new AspirantesController(service);
    const createDto: CreateAspiranteDto = {
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
    const updateDto: UpdateAspiranteDto = { semestre: 6 };

    await expect(controller.create(createDto)).resolves.toEqual({ id: 'id-1' });
    await expect(controller.findOne('id-1')).resolves.toEqual({ id: 'id-1' });
    await expect(controller.update('id-1', updateDto)).resolves.toEqual({
      id: 'id-1',
      semestre: 6,
    });
    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(service.findOne).toHaveBeenCalledWith('id-1');
    expect(service.update).toHaveBeenCalledWith('id-1', updateDto);
  });
});
