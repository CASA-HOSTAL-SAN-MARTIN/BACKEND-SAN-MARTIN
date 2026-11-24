import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Cama } from './entities/cama.entity';
import { EstadoCama } from './enums/estado-cama.enum';

@Injectable()
export class CamasService {
  constructor(
    @InjectRepository(Cama)
    private readonly camasRepository: Repository<Cama>,
  ) {}

  findAll(estado?: EstadoCama): Promise<Cama[]> {
    const options: FindManyOptions<Cama> = {
      relations: { habitacion: true },
      order: { id: 'ASC' },
    };

    if (estado !== undefined) {
      options.where = { estado };
    }

    return this.camasRepository.find(options);
  }

  async findOne(id: string): Promise<Cama> {
    const cama = await this.camasRepository.findOne({
      where: { id },
      relations: { habitacion: true },
    });

    if (!cama) {
      throw new NotFoundException(`No existe una cama con el identificador ${id}`);
    }

    return cama;
  }

  async updateState(id: string, estado: EstadoCama): Promise<Cama> {
    const cama = await this.findOne(id);
    cama.estado = estado;

    return this.camasRepository.save(cama);
  }
}
