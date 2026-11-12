import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAspiranteDto {
  @ApiProperty({ example: 'María Gómez' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @ApiProperty({ example: 'CC-123456789' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  numDoc!: string;

  @ApiProperty({ example: 'Ingeniería de Sistemas' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  programa!: string;

  @ApiProperty({ example: 4.2 })
  @IsNumber()
  promedio!: number;

  @ApiProperty({ example: 17 })
  @IsInt()
  edad!: number;
}
