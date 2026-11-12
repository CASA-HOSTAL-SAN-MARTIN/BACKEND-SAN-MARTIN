import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoContrato } from '../enums/estado-contrato.enum';

export class UpdateContratoDto {
  @IsOptional()
  @IsString()
  @MaxLength(36)
  residenteId?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  valorMensual?: number | null;

  @IsOptional()
  @IsEnum(EstadoContrato)
  estado?: EstadoContrato;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string | null;
}
