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
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { UpdateAspiranteDto } from './dto/update-aspirante.dto';
import { Aspirante } from './entities/aspirante.entity';
import { AspirantesService } from './aspirantes.service';

@ApiTags('Aspirantes')
@Controller('api/aspirantes')
export class AspirantesController {
  constructor(private readonly aspirantesService: AspirantesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar la información de un aspirante' })
  @ApiCreatedResponse({ type: Aspirante })
  create(@Body() createAspiranteDto: CreateAspiranteDto): Promise<Aspirante> {
    return this.aspirantesService.create(createAspiranteDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar la información de un aspirante' })
  @ApiOkResponse({ type: Aspirante })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Aspirante> {
    return this.aspirantesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar la información de un aspirante' })
  @ApiOkResponse({ type: Aspirante })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAspiranteDto: UpdateAspiranteDto,
  ): Promise<Aspirante> {
    return this.aspirantesService.update(id, updateAspiranteDto);
  }
}
