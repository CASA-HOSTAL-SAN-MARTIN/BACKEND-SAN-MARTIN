import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoListaEspera } from '../enums/estado-lista-espera.enum';

export class UpdateEntradaListaEsperaDto {
  @ApiProperty({ enum: EstadoListaEspera, example: EstadoListaEspera.ASIGNADO })
  @IsEnum(EstadoListaEspera)
  estado!: EstadoListaEspera;
}
