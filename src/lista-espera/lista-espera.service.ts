import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aspirante } from '../aspirantes/entities/aspirante.entity';
import { CreateEntradaListaEsperaDto } from './dto/create-entrada-lista-espera.dto';
import { UpdateEntradaListaEsperaDto } from './dto/update-entrada-lista-espera.dto';
import { EntradaListaEspera } from './entities/entrada-lista-espera.entity';

@Injectable()
export class ListaEsperaService {
  constructor(
    @InjectRepository(EntradaListaEspera)
    private readonly listaEsperaRepository: Repository<EntradaListaEspera>,
    @InjectRepository(Aspirante)
    private readonly aspirantesRepository: Repository<Aspirante>,
  ) {}

  findAll(): Promise<EntradaListaEspera[]> {
    return this.listaEsperaRepository.find({
      relations: { aspirante: true },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    createEntradaDto: CreateEntradaListaEsperaDto,
  ): Promise<EntradaListaEspera> {
    const aspirante = await this.aspirantesRepository.findOne({
      where: { id: createEntradaDto.aspiranteId },
    });

    if (!aspirante) {
      throw new NotFoundException(
        `No existe un aspirante con el identificador ${createEntradaDto.aspiranteId}`,
      );
    }

    const existingEntry = await this.listaEsperaRepository.findOne({
      where: { aspiranteId: createEntradaDto.aspiranteId },
    });

    if (existingEntry) {
      throw new ConflictException('El aspirante ya pertenece a la lista de espera');
    }

    const entry = this.listaEsperaRepository.create({
      aspiranteId: aspirante.id,
      aspirante,
    });
    return this.listaEsperaRepository.save(entry);
  }

  async update(
    id: string,
    updateEntradaDto: UpdateEntradaListaEsperaDto,
  ): Promise<EntradaListaEspera> {
    const entry = await this.listaEsperaRepository.findOne({
      where: { id },
      relations: { aspirante: true },
    });

    if (!entry) {
      throw new NotFoundException(`No existe una entrada de lista de espera con el identificador ${id}`);
    }

    entry.estado = updateEntradaDto.estado;
    return this.listaEsperaRepository.save(entry);
  }
}
