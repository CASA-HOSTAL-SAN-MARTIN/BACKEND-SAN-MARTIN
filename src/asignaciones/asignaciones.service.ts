import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CreateAsignacionCamaDto } from './dto/create-asignacion-cama.dto';
import { AsignacionCama } from './entities/asignacion-cama.entity';
import { Cama } from '../camas/entities/cama.entity';
import { EstadoCama } from '../camas/enums/estado-cama.enum';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(AsignacionCama)
    private readonly asignacionesRepository: Repository<AsignacionCama>,
    private readonly dataSource: DataSource,
  ) {}

  create(createAsignacionDto: CreateAsignacionCamaDto): Promise<AsignacionCama> {
    return this.dataSource.transaction(async (manager) => {
      const camasRepository = manager.getRepository(Cama);
      const asignacionesRepository = manager.getRepository(AsignacionCama);
      const cama = await camasRepository.findOne({
        where: { id: createAsignacionDto.camaId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cama) {
        throw new NotFoundException(
          `No existe una cama con el identificador ${createAsignacionDto.camaId}`,
        );
      }

      const asignacionActiva = await asignacionesRepository.findOne({
        where: {
          camaId: cama.id,
          fechaFinalizacion: IsNull(),
        },
      });

      if (cama.estado !== EstadoCama.DISPONIBLE || asignacionActiva) {
        throw new ConflictException(
          `La cama ${cama.id} no está disponible para asignación`,
        );
      }

      const asignacion = asignacionesRepository.create({
        estudianteId: createAsignacionDto.estudianteId,
        camaId: cama.id,
        fechaAsignacion: createAsignacionDto.fechaAsignacion
          ? new Date(createAsignacionDto.fechaAsignacion)
          : new Date(),
        fechaFinalizacion: null,
      });

      const asignacionGuardada = await asignacionesRepository.save(asignacion);
      cama.estado = EstadoCama.OCUPADO;
      await camasRepository.save(cama);

      return asignacionGuardada;
    });
  }

  async findOne(id: string): Promise<AsignacionCama> {
    const asignacion = await this.asignacionesRepository.findOne({ where: { id } });

    if (!asignacion) {
      throw new NotFoundException(
        `No existe una asignación con el identificador ${id}`,
      );
    }

    return asignacion;
  }

  findAllHistory(): Promise<AsignacionCama[]> {
    return this.asignacionesRepository.find({
      order: { fechaAsignacion: 'DESC' },
    });
  }

  findHistoryByBed(camaId: string): Promise<AsignacionCama[]> {
    return this.asignacionesRepository.find({
      where: { camaId },
      order: { fechaAsignacion: 'DESC' },
    });
  }
}
