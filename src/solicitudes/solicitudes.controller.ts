import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudesService } from './solicitudes.service';

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
  @ApiOperation({ summary: 'Consultar las solicitudes registradas' })
  @ApiOkResponse({ type: Solicitud, isArray: true })
  findAll(): Promise<Solicitud[]> {
    return this.solicitudesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una solicitud por identificador' })
  @ApiOkResponse({ type: Solicitud })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Solicitud> {
    return this.solicitudesService.findOne(id);
  }
}
