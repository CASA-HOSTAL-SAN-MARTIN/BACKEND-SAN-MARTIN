import { Pago } from '../../src/pagos/entities/pago.entity';
import { TipoPago } from '../../src/pagos/enums/tipo-pago.enum';
import { PagosService } from '../../src/pagos/pagos.service';
import { ResidentesPagosController } from '../../src/pagos/residentes-pagos.controller';

describe('ResidentesPagosController', () => {
  let controller: ResidentesPagosController;
  let service: jest.Mocked<Pick<PagosService, 'findByResidente'>>;

  beforeEach(() => {
    service = {
      findByResidente: jest.fn(),
    };
    controller = new ResidentesPagosController(
      service as unknown as PagosService,
    );
  });

  it('delegates findByResidente to the service without tipo filter', async () => {
    const expected = [{ id: 'pago-1', residenteId: 'res-1' } as Pago];
    service.findByResidente.mockResolvedValue(expected);

    const result = await controller.findByResidente('res-1');

    expect(service.findByResidente).toHaveBeenCalledWith('res-1', undefined);
    expect(result).toEqual(expected);
  });

  it('delegates findByResidente to the service with tipo filter', async () => {
    const expected = [
      { id: 'pago-1', residenteId: 'res-1', tipo: TipoPago.MENSUALIDAD } as Pago,
    ];
    service.findByResidente.mockResolvedValue(expected);

    const result = await controller.findByResidente('res-1', TipoPago.MENSUALIDAD);

    expect(service.findByResidente).toHaveBeenCalledWith(
      'res-1',
      TipoPago.MENSUALIDAD,
    );
    expect(result).toEqual(expected);
  });
});
