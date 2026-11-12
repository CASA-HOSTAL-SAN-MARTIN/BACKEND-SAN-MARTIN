import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateContratoDto } from '../../src/contratos/dto/create-contrato.dto';
import { UpdateContratoDto } from '../../src/contratos/dto/update-contrato.dto';
import { Contrato } from '../../src/contratos/entities/contrato.entity';
import { ContratosService } from '../../src/contratos/contratos.service';
import { EstadoContrato } from '../../src/contratos/enums/estado-contrato.enum';

describe('ContratosService', () => {
  let service: ContratosService;
  let repository: jest.Mocked<
    Pick<Repository<Contrato>, 'create' | 'find' | 'findOne' | 'save'>
  >;

  const dto: CreateContratoDto = {
    residenteId: 'resident-1',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-06-30',
    valorMensual: 450000,
    estado: EstadoContrato.ACTIVO,
    observaciones: 'Contrato semestral',
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new ContratosService(repository as unknown as Repository<Contrato>);
  });

  it('creates a contract associated with a resident', async () => {
    const contract = { id: 'contract-1', ...dto } as unknown as Contrato;
    repository.create.mockReturnValue(contract);
    repository.save.mockResolvedValue(contract);

    await expect(service.create(dto)).resolves.toEqual(contract);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      residenteId: 'resident-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-06-30',
      valorMensual: 450000,
      estado: EstadoContrato.ACTIVO,
    }));
    expect(repository.save).toHaveBeenCalledWith(contract);
  });

  it('rejects a contract whose final date precedes its start date', async () => {
    await expect(service.create({
      ...dto,
      fechaFin: '2025-12-31',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('returns contracts ordered by creation date', async () => {
    const contracts = [{ id: 'contract-1' } as Contrato];
    repository.find.mockResolvedValue(contracts);

    await expect(service.findAll()).resolves.toEqual(contracts);
    expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('returns a contract by id and rejects unknown ids', async () => {
    const contract = { id: 'contract-1' } as Contrato;
    repository.findOne.mockResolvedValue(contract);
    await expect(service.findOne('contract-1')).resolves.toEqual(contract);

    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates contract information while preserving unspecified fields', async () => {
    const contract = {
      id: 'contract-1',
      residenteId: 'resident-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-06-30',
      valorMensual: 450000,
      estado: EstadoContrato.ACTIVO,
      observaciones: null,
    } as unknown as Contrato;
    const update: UpdateContratoDto = { valorMensual: 500000 };
    repository.findOne.mockResolvedValue(contract);
    repository.save.mockResolvedValue({ ...contract, ...update });

    await expect(service.update('contract-1', update)).resolves.toEqual({
      ...contract,
      valorMensual: 500000,
    });
    expect(repository.save).toHaveBeenCalledWith(contract);
  });
});
