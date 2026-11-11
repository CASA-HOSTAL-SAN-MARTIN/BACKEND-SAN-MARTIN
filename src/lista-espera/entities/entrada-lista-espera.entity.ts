import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoListaEspera } from '../enums/estado-lista-espera.enum';

@Entity('lista_espera')
export class EntradaListaEspera {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
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
