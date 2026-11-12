import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('asignaciones_cama')
@Index(['camaId', 'fechaAsignacion'])
export class AsignacionCama {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'estudiante_id', length: 36 })
  estudianteId!: string;

  @Column({ name: 'cama_id', length: 36 })
  camaId!: string;

  @Column({ name: 'fecha_asignacion', type: 'datetime', precision: 6 })
  fechaAsignacion!: Date;

  @Column({ name: 'fecha_finalizacion', type: 'datetime', precision: 6, nullable: true })
  fechaFinalizacion!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;
}
