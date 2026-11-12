import { ApiProperty } from '@nestjs/swagger';

export class AspiranteResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  nombreCompleto!: string;

  @ApiProperty()
  numDoc!: string;

  @ApiProperty()
  programa!: string;

  @ApiProperty()
  promedio!: number;

  @ApiProperty()
  edad!: number;

  @ApiProperty({
    description: 'Valor calculado como edad < 18; no se almacena en la base de datos.',
  })
  esMenorDeEdad!: boolean;
}
