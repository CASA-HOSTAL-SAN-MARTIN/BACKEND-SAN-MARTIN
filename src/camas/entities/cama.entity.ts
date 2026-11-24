import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  RelationId,
} from 'typeorm';
import { Habitacion } from './habitacion.entity';
import { EstadoCama } from '../enums/estado-cama.enum';

@Entity('camas')
export class Cama {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @ManyToOne(() => Habitacion, { nullable: false })
  @JoinColumn({ name: 'habitacion_id', referencedColumnName: 'id' })
  habitacion!: Habitacion;

  @RelationId((cama: Cama) => cama.habitacion)
  habitacionId!: string;

  @Column({
    type: 'enum',
    enum: EstadoCama,
    default: EstadoCama.DISPONIBLE,
  })
  estado!: EstadoCama;
}
