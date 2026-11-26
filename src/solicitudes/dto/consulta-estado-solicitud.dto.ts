import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class ConsultaEstadoSolicitudDto {
  @IsString()
  @Matches(/^SM-\d{4}-[A-F0-9]{10}$/)
  @MaxLength(18)
  radicado!: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  correo!: string;
}
