import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEntradaListaEsperaDto } from './dto/create-entrada-lista-espera.dto';
import { UpdateEntradaListaEsperaDto } from './dto/update-entrada-lista-espera.dto';
import { EntradaListaEspera } from './entities/entrada-lista-espera.entity';
import { ListaEsperaService } from './lista-espera.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Lista de espera')
@Controller('api/lista-espera')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_SISTEMA, Role.COORDINACION_BIENESTAR)
export class ListaEsperaController {
  constructor(private readonly listaEsperaService: ListaEsperaService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar la lista de espera de aspirantes' })
  @ApiOkResponse({ type: EntradaListaEspera, isArray: true })
  findAll(): Promise<EntradaListaEspera[]> {
    return this.listaEsperaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una entrada de la lista de espera por identificador' })
  @ApiOkResponse({ type: EntradaListaEspera })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<EntradaListaEspera> {
    return this.listaEsperaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Incorporar un aspirante a la lista de espera' })
  @ApiCreatedResponse({ type: EntradaListaEspera })
  create(
    @Body() createEntradaDto: CreateEntradaListaEsperaDto,
  ): Promise<EntradaListaEspera> {
    return this.listaEsperaService.create(createEntradaDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar el estado de un aspirante en la lista de espera' })
  @ApiOkResponse({ type: EntradaListaEspera })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateEntradaDto: UpdateEntradaListaEsperaDto,
  ): Promise<EntradaListaEspera> {
    return this.listaEsperaService.update(id, updateEntradaDto);
  }
}
