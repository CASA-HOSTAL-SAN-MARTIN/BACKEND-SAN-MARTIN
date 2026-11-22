import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoPago } from '../enums/tipo-pago.enum';
import { MetodoPago } from '../enums/metodo-pago.enum';

@Entity('pagos')
@Index(['residenteId'])
@Index(['tipo'])
@Index(['fechaPago'])
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'residente_id', type: 'varchar', length: 36 })
  residenteId!: string;

  @Column({
    type: 'enum',
    enum: TipoPago,
    default: TipoPago.MENSUALIDAD,
  })
  tipo!: TipoPago;

  @Column({ type: 'int', unsigned: true })
  monto!: number;

  @Column({ name: 'fecha_pago', type: 'date' })
  fechaPago!: string;

  @Column({
    name: 'metodo_pago',
    type: 'enum',
    enum: MetodoPago,
    default: MetodoPago.TRANSFERENCIA,
  })
  metodoPago!: MetodoPago;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referencia!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observaciones!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
