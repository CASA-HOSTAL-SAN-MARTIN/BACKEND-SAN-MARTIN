import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateEntradaListaEsperaDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Identificador del aspirante',
    example: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
  })
  @IsUUID()
  aspiranteId!: string;
}
