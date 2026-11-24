import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
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

@ApiTags('Camas')
@Controller('api/camas')
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
