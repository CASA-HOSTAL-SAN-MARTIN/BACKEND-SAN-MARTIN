import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('habitaciones')
export class Habitacion {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'smallint', unsigned: true, unique: true })
  numero!: number;
}
