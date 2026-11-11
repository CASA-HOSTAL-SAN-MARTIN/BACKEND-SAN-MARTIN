import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Aspirante } from '../../aspirantes/entities/aspirante.entity';
import { EstadoListaEspera } from '../enums/estado-lista-espera.enum';

@Entity('lista_espera')
export class EntradaListaEspera {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Aspirante, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'aspirante_id' })
  aspirante!: Aspirante;

  @Column({ name: 'aspirante_id', type: 'varchar', length: 36 })
  aspiranteId!: string;

  @Column({
    type: 'enum',
    enum: EstadoListaEspera,
    default: EstadoListaEspera.PENDIENTE,
  })
  estado!: EstadoListaEspera;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
