import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('aspirantes')
export class Aspirante {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'nombres', length: 100 })
  nombres!: string;

  @Column({ name: 'apellidos', length: 100 })
  apellidos!: string;

  @Index({ unique: true })
  @Column({ name: 'numero_documento', length: 30 })
  numeroDocumento!: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  fechaNacimiento!: string;

  @Column({ length: 150 })
  correo!: string;

  @Column({ length: 30 })
  telefono!: string;

  @Column({ length: 200 })
  direccion!: string;

  @Column({ name: 'universidad', length: 150 })
  universidad!: string;

  @Column({ name: 'programa_academico', length: 150 })
  programaAcademico!: string;

  @Column({ type: 'tinyint', unsigned: true })
  semestre!: number;

  @Column({ name: 'estrato_socioeconomico', type: 'tinyint', unsigned: true })
  estratoSocioeconomico!: number;

  @Column({
    name: 'ingresos_hogar_mensuales',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => Number(value),
    },
  })
  ingresosHogarMensuales!: number;

  @Column({ name: 'personas_a_cargo', type: 'tinyint', unsigned: true })
  personasACargo!: number;

  @Column({ name: 'solicita_beca', type: 'boolean', default: false })
  solicitaBeca!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
