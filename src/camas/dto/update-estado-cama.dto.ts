import { IsEnum } from 'class-validator';
import { EstadoCama } from '../enums/estado-cama.enum';

export class UpdateEstadoCamaDto {
  @IsEnum(EstadoCama)
  estado!: EstadoCama;
}
