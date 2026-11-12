import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AspiranteResponseDto } from './dto/aspirante-response.dto';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { UpdateAspiranteDto } from './dto/update-aspirante.dto';
import { AspirantesService } from './aspirantes.service';

@ApiTags('Aspirantes')
@Controller('api/aspirantes')
export class AspirantesController {
  constructor(private readonly aspirantesService: AspirantesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un aspirante' })
  @ApiCreatedResponse({ type: AspiranteResponseDto })
  create(@Body() dto: CreateAspiranteDto): Promise<AspiranteResponseDto> {
    return this.aspirantesService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un aspirante por identificador' })
  @ApiOkResponse({ type: AspiranteResponseDto })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AspiranteResponseDto> {
    return this.aspirantesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar la información de un aspirante' })
  @ApiOkResponse({ type: AspiranteResponseDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAspiranteDto,
  ): Promise<AspiranteResponseDto> {
    return this.aspirantesService.update(id, dto);
  }
}
