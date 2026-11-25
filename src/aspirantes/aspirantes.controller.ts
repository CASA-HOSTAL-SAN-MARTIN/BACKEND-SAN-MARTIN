import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Aspirantes')
@Controller('api/aspirantes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_SISTEMA, Role.COORDINACION_BIENESTAR)
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
