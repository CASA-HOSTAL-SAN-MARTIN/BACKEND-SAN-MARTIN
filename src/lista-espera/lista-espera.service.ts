import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntradaListaEsperaDto } from './dto/create-entrada-lista-espera.dto';
import { UpdateEntradaListaEsperaDto } from './dto/update-entrada-lista-espera.dto';
import { EntradaListaEspera } from './entities/entrada-lista-espera.entity';

@Injectable()
export class ListaEsperaService {
  constructor(
    @InjectRepository(EntradaListaEspera)
    private readonly listaEsperaRepository: Repository<EntradaListaEspera>,
  ) {}

  findAll(): Promise<EntradaListaEspera[]> {
    return this.listaEsperaRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EntradaListaEspera> {
    const entry = await this.listaEsperaRepository.findOne({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(
        `No existe una entrada de lista de espera con el identificador ${id}`,
      );
    }

    return entry;
  }

  async create(
    createEntradaDto: CreateEntradaListaEsperaDto,
  ): Promise<EntradaListaEspera> {
    const existingEntry = await this.listaEsperaRepository.findOne({
      where: { aspiranteId: createEntradaDto.aspiranteId },
    });

    if (existingEntry) {
      throw new ConflictException('El aspirante ya pertenece a la lista de espera');
    }

    const entry = this.listaEsperaRepository.create({
      aspiranteId: createEntradaDto.aspiranteId,
    });
    return this.listaEsperaRepository.save(entry);
  }

  async update(
    id: string,
    updateEntradaDto: UpdateEntradaListaEsperaDto,
  ): Promise<EntradaListaEspera> {
    const entry = await this.findOne(id);

    entry.estado = updateEntradaDto.estado;
    return this.listaEsperaRepository.save(entry);
  }
}
