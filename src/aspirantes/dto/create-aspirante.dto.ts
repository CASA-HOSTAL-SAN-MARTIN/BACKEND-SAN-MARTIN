import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAspiranteDto {
  @ApiProperty({ example: 'María' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres!: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos!: string;

  @ApiProperty({ example: 'CC-123456789' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(30)
  numeroDocumento!: string;

  @ApiProperty({ example: '2002-08-15', format: 'date' })
  @IsDateString()
  fechaNacimiento!: string;

  @ApiProperty({ example: 'maria.gomez@example.com' })
  @IsEmail()
  correo!: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(30)
  telefono!: string;

  @ApiProperty({ example: 'Carrera 12 # 21-45, Pereira' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  direccion!: string;

  @ApiProperty({ example: 'Universidad del Otún' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  universidad!: string;

  @ApiProperty({ example: 'Ingeniería de Sistemas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  programaAcademico!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  semestre!: number;

  @ApiProperty({ example: 2, minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  estratoSocioeconomico!: number;

  @ApiProperty({ example: 1300000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ingresosHogarMensuales!: number;

  @ApiProperty({ example: 2, minimum: 0, maximum: 50 })
  @IsInt()
  @Min(0)
  @Max(50)
  personasACargo!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  solicitaBeca!: boolean;
}
