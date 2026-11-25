import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAsignacionCamaDto } from './dto/create-asignacion-cama.dto';
import { AsignacionCama } from './entities/asignacion-cama.entity';
import { AsignacionesService } from './asignaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Asignaciones')
@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_SISTEMA, Role.COORDINACION_BIENESTAR, Role.ADMIN_FUNDACION, Role.MONITORA)
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post('asignaciones')
  @ApiOperation({ summary: 'Asignar una cama disponible a un estudiante' })
  @ApiCreatedResponse({ type: AsignacionCama })
  @ApiConflictResponse({ description: 'La cama no está disponible para asignación' })
  @ApiNotFoundResponse({ description: 'La cama no existe' })
  create(@Body() createAsignacionDto: CreateAsignacionCamaDto): Promise<AsignacionCama> {
    return this.asignacionesService.create(createAsignacionDto);
  }

  @Get('asignaciones/historial')
  @ApiOperation({ summary: 'Consultar el historial general de asignaciones' })
  @ApiOkResponse({ type: AsignacionCama, isArray: true })
  findAllHistory(): Promise<AsignacionCama[]> {
    return this.asignacionesService.findAllHistory();
  }

  @Get('asignaciones/:id')
  @ApiOperation({ summary: 'Consultar una asignación por su identificador' })
  @ApiOkResponse({ type: AsignacionCama })
  @ApiNotFoundResponse({ description: 'La asignación no existe' })
  findOne(@Param('id') id: string): Promise<AsignacionCama> {
    return this.asignacionesService.findOne(id);
  }

  @Get('camas/:id/historial')
  @ApiOperation({ summary: 'Consultar el historial de una cama' })
  @ApiOkResponse({ type: AsignacionCama, isArray: true })
  findHistoryByBed(@Param('id') camaId: string): Promise<AsignacionCama[]> {
    return this.asignacionesService.findHistoryByBed(camaId);
  }
}
