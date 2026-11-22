import { DepositosController } from '../../src/pagos/depositos.controller';
import { CreateDepositoDto } from '../../src/pagos/dto/create-deposito.dto';
import { Pago } from '../../src/pagos/entities/pago.entity';
import { TipoPago } from '../../src/pagos/enums/tipo-pago.enum';
import { PagosService } from '../../src/pagos/pagos.service';

describe('DepositosController', () => {
  let controller: DepositosController;
  let service: jest.Mocked<
    Pick<PagosService, 'createDeposito' | 'findAll'>
  >;

  beforeEach(() => {
    service = {
      createDeposito: jest.fn(),
      findAll: jest.fn(),
    };
    controller = new DepositosController(service as unknown as PagosService);
  });

  it('delegates deposit creation to the service', async () => {
    const dto: CreateDepositoDto = {
      residenteId: 'residente-1',
      monto: 150000,
    };
    const expected = { id: 'deposito-1', ...dto, tipo: TipoPago.DEPOSITO } as Pago;
    service.createDeposito.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.createDeposito).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('delegates findAll deposits to the service', async () => {
    const expected = [{ id: 'deposito-1', tipo: TipoPago.DEPOSITO } as Pago];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll('res-1');

    expect(service.findAll).toHaveBeenCalledWith({
      residenteId: 'res-1',
      tipo: TipoPago.DEPOSITO,
    });
    expect(result).toEqual(expected);
  });
});
