import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEntradaListaEsperaDto } from './dto/create-entrada-lista-espera.dto';
import { UpdateEntradaListaEsperaDto } from './dto/update-entrada-lista-espera.dto';
import { EntradaListaEspera } from './entities/entrada-lista-espera.entity';
import { ListaEsperaService } from './lista-espera.service';

@ApiTags('Lista de espera')
@Controller('api/lista-espera')
export class ListaEsperaController {
  constructor(private readonly listaEsperaService: ListaEsperaService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar la lista de espera' })
  @ApiOkResponse({ type: EntradaListaEspera, isArray: true })
  findAll(): Promise<EntradaListaEspera[]> {
    return this.listaEsperaService.findAll();
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
  @ApiOperation({ summary: 'Actualizar el estado de una entrada' })
  @ApiOkResponse({ type: EntradaListaEspera })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateEntradaDto: UpdateEntradaListaEsperaDto,
  ): Promise<EntradaListaEspera> {
    return this.listaEsperaService.update(id, updateEntradaDto);
  }
}
