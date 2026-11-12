import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';
import { ContratosService } from './contratos.service';

@ApiTags('Contratos')
@Controller('api/contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un contrato de alojamiento' })
  @ApiCreatedResponse({ type: Contrato })
  create(@Body() createContratoDto: CreateContratoDto): Promise<Contrato> {
    return this.contratosService.create(createContratoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar contratos registrados' })
  @ApiOkResponse({ type: Contrato, isArray: true })
  findAll(): Promise<Contrato[]> {
    return this.contratosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un contrato por identificador' })
  @ApiOkResponse({ type: Contrato })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Contrato> {
    return this.contratosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un contrato de alojamiento' })
  @ApiOkResponse({ type: Contrato })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateContratoDto: UpdateContratoDto,
  ): Promise<Contrato> {
    return this.contratosService.update(id, updateContratoDto);
  }
}
