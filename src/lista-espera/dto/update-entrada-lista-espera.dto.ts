import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoListaEspera } from '../enums/estado-lista-espera.enum';

export class UpdateEntradaListaEsperaDto {
  @ApiProperty({
    enum: EstadoListaEspera,
    example: EstadoListaEspera.ASIGNADO,
    description: 'Nuevo estado del aspirante en la lista de espera',
  })
  @IsEnum(EstadoListaEspera)
  estado!: EstadoListaEspera;
}
