import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Cama } from './entities/cama.entity';
import { CamasService } from './camas.service';
import { FindCamasDto } from './dto/find-camas.dto';
import { UpdateEstadoCamaDto } from './dto/update-estado-cama.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Camas')
@Controller('api/camas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  Role.ADMIN_SISTEMA,
  Role.COORDINACION_BIENESTAR,
  Role.ADMIN_FUNDACION,
  Role.MONITORA,
  Role.TECNICO_MANTENIMIENTO,
  Role.PORTERIA,
  Role.CONTABILIDAD,
  Role.ASPIRANTE_RESIDENTE,
  Role.ACUDIENTE,
)
export class CamasController {
  constructor(private readonly camasService: CamasService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar camas, opcionalmente filtradas por estado' })
  @ApiOkResponse({ type: Cama, isArray: true })
  @ApiBadRequestResponse({ description: 'El estado consultado no es válido' })
  findAll(@Query() query: FindCamasDto): Promise<Cama[]> {
    return this.camasService.findAll(query.estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una cama por su identificador' })
  @ApiOkResponse({ type: Cama })
  @ApiNotFoundResponse({ description: 'La cama no existe' })
  findOne(@Param('id') id: string): Promise<Cama> {
    return this.camasService.findOne(id);
  }

  @Patch(':id/estado')
  @Roles(Role.ADMIN_SISTEMA, Role.COORDINACION_BIENESTAR, Role.ADMIN_FUNDACION)
  @ApiOperation({ summary: 'Actualizar el estado de una cama' })
  @ApiOkResponse({ type: Cama })
  @ApiBadRequestResponse({ description: 'El estado no es válido' })
  @ApiNotFoundResponse({ description: 'La cama no existe' })
  updateState(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoCamaDto,
  ): Promise<Cama> {
    return this.camasService.updateState(id, updateEstadoDto.estado);
  }
}
