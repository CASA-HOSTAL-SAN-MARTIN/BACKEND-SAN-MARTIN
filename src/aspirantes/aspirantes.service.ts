import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { UpdateAspiranteDto } from './dto/update-aspirante.dto';
import { Aspirante } from './entities/aspirante.entity';

@Injectable()
export class AspirantesService {
  constructor(
    @InjectRepository(Aspirante)
    private readonly aspirantesRepository: Repository<Aspirante>,
  ) {}

  async create(createAspiranteDto: CreateAspiranteDto): Promise<Aspirante> {
    const existingAspirante = await this.aspirantesRepository.findOne({
      where: { numeroDocumento: createAspiranteDto.numeroDocumento },
    });

    if (existingAspirante) {
      throw new ConflictException(
        'Ya existe un aspirante registrado para el número de documento proporcionado',
      );
    }

    const aspirante = this.aspirantesRepository.create(createAspiranteDto);
    return this.aspirantesRepository.save(aspirante);
  }

  async findOne(id: string): Promise<Aspirante> {
    const aspirante = await this.aspirantesRepository.findOne({ where: { id } });

    if (!aspirante) {
      throw new NotFoundException(`No existe un aspirante con el identificador ${id}`);
    }

    return aspirante;
  }

  async update(id: string, updateAspiranteDto: UpdateAspiranteDto): Promise<Aspirante> {
    const aspirante = await this.findOne(id);

    if (Object.keys(updateAspiranteDto).length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un campo para actualizar');
    }

    if (
      updateAspiranteDto.numeroDocumento &&
      updateAspiranteDto.numeroDocumento !== aspirante.numeroDocumento
    ) {
      const existingAspirante = await this.aspirantesRepository.findOne({
        where: { numeroDocumento: updateAspiranteDto.numeroDocumento },
      });

      if (existingAspirante) {
        throw new ConflictException(
          'Ya existe un aspirante registrado para el número de documento proporcionado',
        );
      }
    }

    Object.assign(aspirante, updateAspiranteDto);
    return this.aspirantesRepository.save(aspirante);
  }
}
