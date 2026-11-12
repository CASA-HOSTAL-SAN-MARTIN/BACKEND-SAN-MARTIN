import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { AspiranteResponseDto } from '../../src/aspirantes/dto/aspirante-response.dto';
import { CreateAspiranteDto } from '../../src/aspirantes/dto/create-aspirante.dto';
import { UpdateAspiranteDto } from '../../src/aspirantes/dto/update-aspirante.dto';
import { AspirantesController } from '../../src/aspirantes/aspirantes.controller';
import { AspirantesService } from '../../src/aspirantes/aspirantes.service';

describe('AspirantesController', () => {
  it('declares the Issue 9 routes', () => {
    const prototype = AspirantesController.prototype;

    expect(Reflect.getMetadata(PATH_METADATA, AspirantesController)).toBe(
      'api/aspirantes',
    );
    expect(Reflect.getMetadata(PATH_METADATA, prototype.create)).toBe('/');
    expect(Reflect.getMetadata(METHOD_METADATA, prototype.create)).toBe(
      RequestMethod.POST,
    );
    expect(Reflect.getMetadata(PATH_METADATA, prototype.findOne)).toBe(':id');
    expect(Reflect.getMetadata(METHOD_METADATA, prototype.findOne)).toBe(
      RequestMethod.GET,
    );
    expect(Reflect.getMetadata(PATH_METADATA, prototype.update)).toBe(':id');
    expect(Reflect.getMetadata(METHOD_METADATA, prototype.update)).toBe(
      RequestMethod.PUT,
    );
  });

  it('delegates create, read and update operations to the service', async () => {
    const response: AspiranteResponseDto = {
      id: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
      nombreCompleto: 'María Gómez',
      numDoc: 'CC-123456789',
      programa: 'Ingeniería de Sistemas',
      promedio: 4.2,
      edad: 17,
      esMenorDeEdad: true,
    };
    const service = {
      create: jest.fn().mockResolvedValue(response),
      findOne: jest.fn().mockResolvedValue(response),
      update: jest.fn().mockResolvedValue(response),
    } as unknown as AspirantesService;
    const controller = new AspirantesController(service);
    const createDto: CreateAspiranteDto = {
      nombreCompleto: response.nombreCompleto,
      numDoc: response.numDoc,
      programa: response.programa,
      promedio: response.promedio,
      edad: response.edad,
    };
    const updateDto: UpdateAspiranteDto = { ...createDto, edad: 18 };

    await expect(controller.create(createDto)).resolves.toEqual(response);
    await expect(controller.findOne(response.id)).resolves.toEqual(response);
    await expect(controller.update(response.id, updateDto)).resolves.toEqual(
      response,
    );
    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(service.findOne).toHaveBeenCalledWith(response.id);
    expect(service.update).toHaveBeenCalledWith(response.id, updateDto);
  });
});
