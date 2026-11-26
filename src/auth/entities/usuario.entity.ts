import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Rol } from './rol.entity';
import { Solicitud } from '../../solicitudes/entities/solicitud.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150, unique: true, nullable: true })
  correo!: string;

  @Column({ name: 'numero_documento', type: 'varchar', length: 30, unique: true, nullable: true })
  numeroDocumento!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 60, nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ name: 'password_setup_token_hash', type: 'char', length: 64, nullable: true, select: false })
  passwordSetupTokenHash!: string | null;

  @Column({ name: 'password_setup_token_expires_at', type: 'datetime', precision: 6, nullable: true, select: false })
  passwordSetupTokenExpiresAt!: Date | null;

  @OneToOne(() => Solicitud, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'solicitud_id', referencedColumnName: 'id' })
  solicitud!: Solicitud | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  @ManyToMany(() => Rol, (rol) => rol.usuarios, { eager: false })
  @JoinTable({
    name: 'usuarios_roles',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
  })
  roles!: Rol[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
