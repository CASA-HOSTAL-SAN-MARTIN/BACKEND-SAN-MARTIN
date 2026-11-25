import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Pago } from './entities/pago.entity';
import { TipoPago } from './enums/tipo-pago.enum';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Pagos')
@Controller('api/pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_SISTEMA, Role.ADMIN_FUNDACION, Role.CONTABILIDAD)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un pago mensual de alojamiento' })
  @ApiCreatedResponse({ type: Pago })
  create(@Body() createPagoDto: CreatePagoDto): Promise<Pago> {
    return this.pagosService.createPago(createPagoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar pagos y transacciones registradas' })
  @ApiOkResponse({ type: Pago, isArray: true })
  @ApiQuery({ name: 'residenteId', required: false, description: 'Filtrar por identificador de residente' })
  @ApiQuery({ name: 'tipo', enum: TipoPago, required: false, description: 'Filtrar por tipo de pago (mensualidad o deposito)' })
  findAll(
    @Query('residenteId') residenteId?: string,
    @Query('tipo') tipo?: TipoPago,
  ): Promise<Pago[]> {
    return this.pagosService.findAll({ residenteId, tipo });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un pago por identificador' })
  @ApiOkResponse({ type: Pago })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Pago> {
    return this.pagosService.findOne(id);
  }
}
