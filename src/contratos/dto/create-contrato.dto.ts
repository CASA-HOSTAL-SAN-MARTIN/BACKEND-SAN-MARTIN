import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoContrato } from '../enums/estado-contrato.enum';

export class CreateContratoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  residenteId!: string;

  @IsDateString()
  fechaInicio!: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  valorMensual?: number;

  @IsOptional()
  @IsEnum(EstadoContrato)
  estado?: EstadoContrato;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
