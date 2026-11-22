import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateDepositoDto } from '../../src/pagos/dto/create-deposito.dto';
import { CreatePagoDto } from '../../src/pagos/dto/create-pago.dto';
import { Pago } from '../../src/pagos/entities/pago.entity';
import { MetodoPago } from '../../src/pagos/enums/metodo-pago.enum';
import { TipoPago } from '../../src/pagos/enums/tipo-pago.enum';
import { PagosService } from '../../src/pagos/pagos.service';

describe('PagosService', () => {
  let service: PagosService;
  let repository: jest.Mocked<
    Pick<Repository<Pago>, 'create' | 'find' | 'findOne' | 'save'>
  >;

  const residenteId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new PagosService(repository as unknown as Repository<Pago>);
  });

  describe('createPago', () => {
    it('creates and saves a monthly payment with default transfer method', async () => {
      const dto: CreatePagoDto = {
        residenteId,
        monto: 300000,
        fechaPago: '2026-11-15',
        referencia: 'REC-001',
        observaciones: 'Pago mensualidad noviembre',
      };

      const entity = {
        id: 'pago-1',
        ...dto,
        tipo: TipoPago.MENSUALIDAD,
        metodoPago: MetodoPago.TRANSFERENCIA,
      } as Pago;

      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.createPago(dto);

      expect(repository.create).toHaveBeenCalledWith({
        residenteId: dto.residenteId,
        tipo: TipoPago.MENSUALIDAD,
        monto: dto.monto,
        fechaPago: dto.fechaPago,
        metodoPago: MetodoPago.TRANSFERENCIA,
        referencia: dto.referencia,
        observaciones: dto.observaciones,
      });
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('creates a monthly payment with custom payment method', async () => {
      const dto: CreatePagoDto = {
        residenteId,
        monto: 250000,
        fechaPago: '2026-11-10',
        metodoPago: MetodoPago.EFECTIVO,
      };

      const entity = {
        id: 'pago-2',
        ...dto,
        tipo: TipoPago.MENSUALIDAD,
        referencia: null,
        observaciones: null,
      } as Pago;

      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.createPago(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metodoPago: MetodoPago.EFECTIVO,
        }),
      );
      expect(result).toEqual(entity);
    });
  });

  describe('createDeposito', () => {
    it('creates and saves a deposit with current date when fechaPago is omitted', async () => {
      const dto: CreateDepositoDto = {
        residenteId,
        monto: 150000,
        referencia: 'DEP-101',
      };

      const today = new Date().toISOString().slice(0, 10);
      const entity = {
        id: 'deposito-1',
        ...dto,
        fechaPago: today,
        tipo: TipoPago.DEPOSITO,
        metodoPago: MetodoPago.TRANSFERENCIA,
      } as Pago;

      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.createDeposito(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          residenteId,
          tipo: TipoPago.DEPOSITO,
          monto: 150000,
          fechaPago: today,
        }),
      );
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('creates a deposit with specified date and observations', async () => {
      const dto: CreateDepositoDto = {
        residenteId,
        monto: 200000,
        fechaPago: '2026-11-01',
        metodoPago: MetodoPago.CONSIGNACION,
        observaciones: 'Depósito de garantía',
      };

      const entity = {
        id: 'deposito-2',
        ...dto,
        tipo: TipoPago.DEPOSITO,
        referencia: null,
      } as Pago;

      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.createDeposito(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fechaPago: '2026-11-01',
          metodoPago: MetodoPago.CONSIGNACION,
          observaciones: 'Depósito de garantía',
        }),
      );
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('returns all payments ordered by date descending', async () => {
      const payments = [{ id: 'pago-1' } as Pago];
      repository.find.mockResolvedValue(payments);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        order: { fechaPago: 'DESC', createdAt: 'DESC' },
      });
      expect(result).toEqual(payments);
    });

    it('filters payments by residenteId and tipo', async () => {
      const payments = [{ id: 'pago-1', residenteId, tipo: TipoPago.MENSUALIDAD } as Pago];
      repository.find.mockResolvedValue(payments);

      const result = await service.findAll({
        residenteId,
        tipo: TipoPago.MENSUALIDAD,
      });

      expect(repository.find).toHaveBeenCalledWith({
        where: { residenteId, tipo: TipoPago.MENSUALIDAD },
        order: { fechaPago: 'DESC', createdAt: 'DESC' },
      });
      expect(result).toEqual(payments);
    });
  });

  describe('findOne', () => {
    it('returns the payment if found', async () => {
      const payment = { id: 'pago-1' } as Pago;
      repository.findOne.mockResolvedValue(payment);

      const result = await service.findOne('pago-1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'pago-1' } });
      expect(result).toEqual(payment);
    });

    it('throws NotFoundException if payment is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByResidente', () => {
    it('returns all transactions for the given resident', async () => {
      const payments = [
        { id: 'pago-1', residenteId } as Pago,
        { id: 'dep-1', residenteId } as Pago,
      ];
      repository.find.mockResolvedValue(payments);

      const result = await service.findByResidente(residenteId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { residenteId },
        order: { fechaPago: 'DESC', createdAt: 'DESC' },
      });
      expect(result).toEqual(payments);
    });

    it('filters resident transactions by tipo', async () => {
      const deposits = [{ id: 'dep-1', residenteId, tipo: TipoPago.DEPOSITO } as Pago];
      repository.find.mockResolvedValue(deposits);

      const result = await service.findByResidente(residenteId, TipoPago.DEPOSITO);

      expect(repository.find).toHaveBeenCalledWith({
        where: { residenteId, tipo: TipoPago.DEPOSITO },
        order: { fechaPago: 'DESC', createdAt: 'DESC' },
      });
      expect(result).toEqual(deposits);
    });
  });
});
