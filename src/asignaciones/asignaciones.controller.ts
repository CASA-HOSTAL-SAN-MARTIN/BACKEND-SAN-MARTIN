import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAsignacionCamaDto } from './dto/create-asignacion-cama.dto';
import { AsignacionCama } from './entities/asignacion-cama.entity';
import { AsignacionesService } from './asignaciones.service';

@ApiTags('Asignaciones')
@Controller('api')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post('asignaciones')
  @ApiOperation({ summary: 'Registrar una asignación de cama en el historial' })
  @ApiCreatedResponse({ type: AsignacionCama })
  create(@Body() createAsignacionDto: CreateAsignacionCamaDto): Promise<AsignacionCama> {
    return this.asignacionesService.create(createAsignacionDto);
  }

  @Get('asignaciones/historial')
  @ApiOperation({ summary: 'Consultar el historial general de asignaciones' })
  @ApiOkResponse({ type: AsignacionCama, isArray: true })
  findAllHistory(): Promise<AsignacionCama[]> {
    return this.asignacionesService.findAllHistory();
  }

  @Get('camas/:id/historial')
  @ApiOperation({ summary: 'Consultar el historial de una cama' })
  @ApiOkResponse({ type: AsignacionCama, isArray: true })
  findHistoryByBed(@Param('id') camaId: string): Promise<AsignacionCama[]> {
    return this.asignacionesService.findHistoryByBed(camaId);
  }
}
