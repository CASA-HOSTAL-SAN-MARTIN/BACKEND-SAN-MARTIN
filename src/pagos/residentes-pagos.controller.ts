import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Pago } from './entities/pago.entity';
import { TipoPago } from './enums/tipo-pago.enum';
import { PagosService } from './pagos.service';

@ApiTags('Residentes - Pagos')
@Controller('api/residentes')
export class ResidentesPagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get(':id/pagos')
  @ApiOperation({ summary: 'Consultar el historial de pagos y depósitos de un residente' })
  @ApiOkResponse({ type: Pago, isArray: true })
  @ApiQuery({ name: 'tipo', enum: TipoPago, required: false, description: 'Filtrar por tipo de pago (mensualidad o deposito)' })
  findByResidente(
    @Param('id') id: string,
    @Query('tipo') tipo?: TipoPago,
  ): Promise<Pago[]> {
    return this.pagosService.findByResidente(id, tipo);
  }
}
