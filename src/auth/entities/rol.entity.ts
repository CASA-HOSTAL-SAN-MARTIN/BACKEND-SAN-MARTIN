import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../common/enums/roles.enum';
import { Usuario } from './usuario.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: Role, unique: true })
  nombre!: Role;

  @ManyToMany(() => Usuario, (usuario) => usuario.roles)
  usuarios!: Usuario[];
}
