import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Pago } from './entities/pago.entity';
import { MetodoPago } from './enums/metodo-pago.enum';
import { TipoPago } from './enums/tipo-pago.enum';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
  ) {}

  async createPago(createPagoDto: CreatePagoDto): Promise<Pago> {
    const pago = this.pagosRepository.create({
      residenteId: createPagoDto.residenteId,
      tipo: TipoPago.MENSUALIDAD,
      monto: createPagoDto.monto,
      fechaPago: createPagoDto.fechaPago,
      metodoPago: createPagoDto.metodoPago ?? MetodoPago.TRANSFERENCIA,
      referencia: createPagoDto.referencia ?? null,
      observaciones: createPagoDto.observaciones ?? null,
    });

    return this.pagosRepository.save(pago);
  }

  async createDeposito(createDepositoDto: CreateDepositoDto): Promise<Pago> {
    const fechaPago =
      createDepositoDto.fechaPago ?? new Date().toISOString().slice(0, 10);

    const deposito = this.pagosRepository.create({
      residenteId: createDepositoDto.residenteId,
      tipo: TipoPago.DEPOSITO,
      monto: createDepositoDto.monto,
      fechaPago,
      metodoPago: createDepositoDto.metodoPago ?? MetodoPago.TRANSFERENCIA,
      referencia: createDepositoDto.referencia ?? null,
      observaciones: createDepositoDto.observaciones ?? null,
    });

    return this.pagosRepository.save(deposito);
  }

  findAll(filters?: { residenteId?: string; tipo?: TipoPago }): Promise<Pago[]> {
    const where: FindOptionsWhere<Pago> = {};
    if (filters?.residenteId) {
      where.residenteId = filters.residenteId;
    }
    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    return this.pagosRepository.find({
      where,
      order: { fechaPago: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({ where: { id } });

    if (!pago) {
      throw new NotFoundException(`No existe un registro de pago con el identificador ${id}`);
    }

    return pago;
  }

  findByResidente(residenteId: string, tipo?: TipoPago): Promise<Pago[]> {
    const where: FindOptionsWhere<Pago> = { residenteId };
    if (tipo) {
      where.tipo = tipo;
    }

    return this.pagosRepository.find({
      where,
      order: { fechaPago: 'DESC', createdAt: 'DESC' },
    });
  }
}
