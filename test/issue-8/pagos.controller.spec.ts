import { CreatePagoDto } from '../../src/pagos/dto/create-pago.dto';
import { Pago } from '../../src/pagos/entities/pago.entity';
import { TipoPago } from '../../src/pagos/enums/tipo-pago.enum';
import { PagosController } from '../../src/pagos/pagos.controller';
import { PagosService } from '../../src/pagos/pagos.service';

describe('PagosController', () => {
  let controller: PagosController;
  let service: jest.Mocked<
    Pick<PagosService, 'createPago' | 'findAll' | 'findOne'>
  >;

  beforeEach(() => {
    service = {
      createPago: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    controller = new PagosController(service as unknown as PagosService);
  });

  it('delegates payment creation to the service', async () => {
    const dto: CreatePagoDto = {
      residenteId: 'residente-1',
      monto: 350000,
      fechaPago: '2026-11-20',
    };
    const expected = { id: 'pago-1', ...dto } as Pago;
    service.createPago.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.createPago).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('delegates findAll to the service with filters', async () => {
    const expected = [{ id: 'pago-1' } as Pago];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll('res-1', TipoPago.MENSUALIDAD);

    expect(service.findAll).toHaveBeenCalledWith({
      residenteId: 'res-1',
      tipo: TipoPago.MENSUALIDAD,
    });
    expect(result).toEqual(expected);
  });

  it('delegates findOne to the service', async () => {
    const expected = { id: 'pago-1' } as Pago;
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('pago-1');

    expect(service.findOne).toHaveBeenCalledWith('pago-1');
    expect(result).toEqual(expected);
  });
});
