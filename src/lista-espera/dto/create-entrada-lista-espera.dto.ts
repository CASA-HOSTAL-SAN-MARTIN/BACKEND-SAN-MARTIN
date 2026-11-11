import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateEntradaListaEsperaDto {
  @ApiProperty({ format: 'uuid', description: 'Identificador del aspirante' })
  @IsUUID()
  aspiranteId!: string;
}
