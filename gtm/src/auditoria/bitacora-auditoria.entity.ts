import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'bitacora_auditoria' })
export class BitacoraAuditoria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 10 })
  accion!: string;

  @Column({ type: 'varchar', length: 255 })
  recurso!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'datos_entrada', type: 'jsonb', nullable: true })
  datosEntrada?: Record<string, any>;

  @Column({ type: 'varchar', length: 100, default: 'sistema' })
  usuario!: string;

  @Column({ name: 'direccion_ip', type: 'varchar', length: 45, nullable: true })
  direccionIp?: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}
