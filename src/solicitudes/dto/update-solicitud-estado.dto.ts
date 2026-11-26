import { IsEnum } from 'class-validator';
import { EstadoSolicitud } from '../enums/estado-solicitud.enum';

export class UpdateSolicitudEstadoDto {
  @IsEnum(EstadoSolicitud)
  estado!: EstadoSolicitud;
}
