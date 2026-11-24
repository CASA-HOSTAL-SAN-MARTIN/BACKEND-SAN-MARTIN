import { IsEnum, IsOptional } from 'class-validator';
import { EstadoCama } from '../enums/estado-cama.enum';

export class FindCamasDto {
  @IsOptional()
  @IsEnum(EstadoCama)
  estado?: EstadoCama;
}
