import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsignacionCamaDto } from './dto/create-asignacion-cama.dto';
import { AsignacionCama } from './entities/asignacion-cama.entity';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(AsignacionCama)
    private readonly asignacionesRepository: Repository<AsignacionCama>,
  ) {}

  create(createAsignacionDto: CreateAsignacionCamaDto): Promise<AsignacionCama> {
    const asignacion = this.asignacionesRepository.create({
      estudianteId: createAsignacionDto.estudianteId,
      camaId: createAsignacionDto.camaId,
      fechaAsignacion: createAsignacionDto.fechaAsignacion
        ? new Date(createAsignacionDto.fechaAsignacion)
        : new Date(),
      fechaFinalizacion: createAsignacionDto.fechaFinalizacion
        ? new Date(createAsignacionDto.fechaFinalizacion)
        : null,
    });

    return this.asignacionesRepository.save(asignacion);
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
