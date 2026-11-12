import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoContrato } from '../enums/estado-contrato.enum';

@Entity('contratos')
@Index(['residenteId', 'fechaInicio'])
export class Contrato {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'residente_id', length: 36 })
  residenteId!: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin!: string | null;

  @Column({ name: 'valor_mensual', type: 'int', unsigned: true, nullable: true })
  valorMensual!: number | null;

  @Column({
    type: 'enum',
    enum: EstadoContrato,
    default: EstadoContrato.ACTIVO,
  })
  estado!: EstadoContrato;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observaciones!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
