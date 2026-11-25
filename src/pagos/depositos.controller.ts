import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { Pago } from './entities/pago.entity';
import { TipoPago } from './enums/tipo-pago.enum';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Depósitos')
@Controller('api/depositos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_SISTEMA, Role.ADMIN_FUNDACION, Role.CONTABILIDAD)
export class DepositosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un depósito o garantía de un residente' })
  @ApiCreatedResponse({ type: Pago })
  create(@Body() createDepositoDto: CreateDepositoDto): Promise<Pago> {
    return this.pagosService.createDeposito(createDepositoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar todos los depósitos registrados' })
  @ApiOkResponse({ type: Pago, isArray: true })
  @ApiQuery({ name: 'residenteId', required: false, description: 'Filtrar por identificador de residente' })
  findAll(@Query('residenteId') residenteId?: string): Promise<Pago[]> {
    return this.pagosService.findAll({ residenteId, tipo: TipoPago.DEPOSITO });
  }
}
