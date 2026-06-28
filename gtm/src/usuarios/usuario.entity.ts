import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RolUsuario {
  Administrador = 'Administrador',
  Recepcionista = 'Recepcionista',
  Mecanico = 'Mecanico',
  Inventario = 'Inventario',
}

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column({ name: 'contrasena_hash' })
  contrasenaHash: string;

  @Column({
    enum: RolUsuario,
    default: RolUsuario.Recepcionista,
    type: 'enum',
  })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'refresh_token_hash', nullable: true, type: 'text' })
  refreshTokenHash?: string | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
