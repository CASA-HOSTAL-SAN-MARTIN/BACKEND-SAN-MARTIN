import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('aspirantes')
export class Aspirante {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'nombre_completo', type: 'text' })
  nombreCompleto!: string;

  @Column({ name: 'num_doc', type: 'text' })
  numDoc!: string;

  @Column({ type: 'text' })
  programa!: string;

  @Column({ type: 'double' })
  promedio!: number;

  @Column({ type: 'int' })
  edad!: number;
}
