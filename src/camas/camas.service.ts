import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, IsNull, Repository } from 'typeorm';
import { AsignacionCama } from '../asignaciones/entities/asignacion-cama.entity';
import { Cama } from './entities/cama.entity';
import { EstadoCama } from './enums/estado-cama.enum';

@Injectable()
export class CamasService {
  constructor(
    @InjectRepository(Cama)
    private readonly camasRepository: Repository<Cama>,
    private readonly dataSource: DataSource,
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
    return this.dataSource.transaction(async (manager) => {
      const cama = await manager.getRepository(Cama).findOne({
        where: { id },
        relations: { habitacion: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cama) {
        throw new NotFoundException(`No existe una cama con el identificador ${id}`);
      }

      const asignacionActiva = await manager
        .getRepository(AsignacionCama)
        .findOne({
          where: { camaId: id, fechaFinalizacion: IsNull() },
        });

      if (asignacionActiva && estado !== EstadoCama.OCUPADO) {
        throw new ConflictException(
          `La cama ${id} tiene una asignación activa y debe permanecer ocupada`,
        );
      }

      cama.estado = estado;
      return manager.getRepository(Cama).save(cama);
    });
  }
}
