import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Pago } from './entities/pago.entity';
import { TipoPago } from './enums/tipo-pago.enum';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Residentes - Pagos')
@Controller('api/residentes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_SISTEMA, Role.ADMIN_FUNDACION, Role.CONTABILIDAD)
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
