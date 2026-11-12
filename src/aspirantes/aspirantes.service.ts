import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AspiranteResponseDto } from './dto/aspirante-response.dto';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { UpdateAspiranteDto } from './dto/update-aspirante.dto';
import { Aspirante } from './entities/aspirante.entity';

@Injectable()
export class AspirantesService {
  constructor(
    @InjectRepository(Aspirante)
    private readonly aspirantesRepository: Repository<Aspirante>,
  ) {}

  async create(dto: CreateAspiranteDto): Promise<AspiranteResponseDto> {
    const aspirante = this.aspirantesRepository.create(dto);
    return this.toResponse(await this.aspirantesRepository.save(aspirante));
  }

  async findOne(id: string): Promise<AspiranteResponseDto> {
    return this.toResponse(await this.findEntity(id));
  }

  async update(id: string, dto: UpdateAspiranteDto): Promise<AspiranteResponseDto> {
    const aspirante = await this.findEntity(id);
    Object.assign(aspirante, dto);
    return this.toResponse(await this.aspirantesRepository.save(aspirante));
  }

  private async findEntity(id: string): Promise<Aspirante> {
    const aspirante = await this.aspirantesRepository.findOne({ where: { id } });

    if (!aspirante) {
      throw new NotFoundException(`No existe un aspirante con el identificador ${id}`);
    }

    return aspirante;
  }

  private toResponse(aspirante: Aspirante): AspiranteResponseDto {
    return {
      id: aspirante.id,
      nombreCompleto: aspirante.nombreCompleto,
      numDoc: aspirante.numDoc,
      programa: aspirante.programa,
      promedio: aspirante.promedio,
      edad: aspirante.edad,
      esMenorDeEdad: aspirante.edad < 18,
    };
  }
}
