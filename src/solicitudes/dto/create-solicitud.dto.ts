import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSolicitudDto {
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

  @ApiProperty({ example: 'maria.gomez@example.com' })
  @IsEmail()
  correo!: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(30)
  telefono!: string;

  @ApiProperty({ example: 'Ingeniería de Sistemas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  programaAcademico!: string;

  @ApiProperty({ example: 'Universidad del Otún' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  universidad!: string;
}
