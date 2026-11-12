import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private readonly contratosRepository: Repository<Contrato>,
  ) {}

  findAll(): Promise<Contrato[]> {
    return this.contratosRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contrato> {
    const contrato = await this.contratosRepository.findOne({ where: { id } });

    if (!contrato) {
      throw new NotFoundException(`No existe un contrato con el identificador ${id}`);
    }

    return contrato;
  }

  async create(createContratoDto: CreateContratoDto): Promise<Contrato> {
    this.validatePeriod(createContratoDto.fechaInicio, createContratoDto.fechaFin);
    const contrato = this.contratosRepository.create({
      residenteId: createContratoDto.residenteId,
      fechaInicio: createContratoDto.fechaInicio,
      fechaFin: createContratoDto.fechaFin ?? null,
      valorMensual: createContratoDto.valorMensual ?? null,
      estado: createContratoDto.estado,
      observaciones: createContratoDto.observaciones ?? null,
    });

    return this.contratosRepository.save(contrato);
  }

  async update(id: string, updateContratoDto: UpdateContratoDto): Promise<Contrato> {
    const contrato = await this.findOne(id);
    const fechaInicio = updateContratoDto.fechaInicio ?? contrato.fechaInicio;
    const fechaFin = updateContratoDto.fechaFin === undefined
      ? contrato.fechaFin ?? undefined
      : updateContratoDto.fechaFin ?? undefined;
    this.validatePeriod(fechaInicio, fechaFin);

    if (updateContratoDto.residenteId !== undefined) contrato.residenteId = updateContratoDto.residenteId;
    if (updateContratoDto.fechaInicio !== undefined) contrato.fechaInicio = updateContratoDto.fechaInicio;
    if (updateContratoDto.fechaFin !== undefined) contrato.fechaFin = updateContratoDto.fechaFin;
    if (updateContratoDto.valorMensual !== undefined) contrato.valorMensual = updateContratoDto.valorMensual;
    if (updateContratoDto.estado !== undefined) contrato.estado = updateContratoDto.estado;
    if (updateContratoDto.observaciones !== undefined) contrato.observaciones = updateContratoDto.observaciones;

    return this.contratosRepository.save(contrato);
  }

  private validatePeriod(fechaInicio: string, fechaFin?: string): void {
    if (fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      throw new BadRequestException('La fecha de finalización no puede ser anterior a la fecha de inicio');
    }
  }
}
