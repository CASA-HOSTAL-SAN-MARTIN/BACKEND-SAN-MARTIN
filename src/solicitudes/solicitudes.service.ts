import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { Solicitud } from './entities/solicitud.entity';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudesRepository: Repository<Solicitud>,
  ) {}

  async create(createSolicitudDto: CreateSolicitudDto): Promise<Solicitud> {
    const existingSolicitud = await this.solicitudesRepository.findOne({
      where: { numeroDocumento: createSolicitudDto.numeroDocumento },
    });

    if (existingSolicitud) {
      throw new ConflictException(
        'Ya existe una solicitud registrada para el número de documento proporcionado',
      );
    }

    const solicitud = this.solicitudesRepository.create(createSolicitudDto);
    return this.solicitudesRepository.save(solicitud);
  }

  findAll(): Promise<Solicitud[]> {
    return this.solicitudesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Solicitud> {
    const solicitud = await this.solicitudesRepository.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException(`No existe una solicitud con el identificador ${id}`);
    }

    return solicitud;
  }
}
