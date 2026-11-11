import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoSolicitud } from '../enums/estado-solicitud.enum';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nombres!: string;

  @Column({ length: 100 })
  apellidos!: string;

  @Index({ unique: true })
  @Column({ name: 'numero_documento', length: 30 })
  numeroDocumento!: string;

  @Column({ length: 150 })
  correo!: string;

  @Column({ length: 30 })
  telefono!: string;

  @Column({ name: 'programa_academico', length: 150 })
  programaAcademico!: string;

  @Column({ name: 'universidad', length: 150 })
  universidad!: string;

  @Column({ type: 'enum', enum: EstadoSolicitud, default: EstadoSolicitud.PENDIENTE })
  estado!: EstadoSolicitud;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
