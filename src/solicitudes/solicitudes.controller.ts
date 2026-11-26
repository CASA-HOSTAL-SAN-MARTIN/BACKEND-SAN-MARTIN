import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudesService } from './solicitudes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { UpdateSolicitudEstadoDto } from './dto/update-solicitud-estado.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('Solicitudes')
@Controller('api/solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una solicitud de cupo' })
  @ApiCreatedResponse({ type: Solicitud })
  create(@Body() createSolicitudDto: CreateSolicitudDto): Promise<Solicitud> {
    return this.solicitudesService.create(createSolicitudDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_SISTEMA, Role.COORDINACION_BIENESTAR)
  @ApiOperation({ summary: 'Consultar las solicitudes registradas' })
  @ApiOkResponse({ type: Solicitud, isArray: true })
  findAll(): Promise<Solicitud[]> {
    return this.solicitudesService.findAll();
  }

  @Get('mia')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ASPIRANTE_RESIDENTE)
  @ApiOperation({ summary: 'Consultar el estado de la solicitud propia del aspirante autenticado' })
  @ApiOkResponse({ type: Solicitud })
  findMine(@Req() request: AuthenticatedRequest): Promise<Solicitud> {
    return this.solicitudesService.findMine(request.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_SISTEMA, Role.COORDINACION_BIENESTAR)
  @ApiOperation({ summary: 'Consultar una solicitud por identificador' })
  @ApiOkResponse({ type: Solicitud })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Solicitud> {
    return this.solicitudesService.findOne(id);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_SISTEMA, Role.COORDINACION_BIENESTAR)
  @ApiOperation({ summary: 'Actualizar el estado de revisión de una solicitud' })
  @ApiOkResponse({ type: Solicitud })
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSolicitudEstadoDto,
  ): Promise<Solicitud> {
    return this.solicitudesService.updateStatus(id, dto);
  }
}
