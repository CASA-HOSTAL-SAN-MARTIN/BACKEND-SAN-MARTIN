import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAsignacionCamaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  estudianteId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  camaId!: string;

  @IsOptional()
  @IsDateString()
  fechaAsignacion?: string;

  @IsOptional()
  @IsDateString()
  fechaFinalizacion?: string;
}
