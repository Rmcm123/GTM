import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';

@Entity({ name: 'registros_tiempo' })
export class RegistroTiempo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orden_trabajo_id' })
  ordenTrabajoId: number;

  @ManyToOne(() => OrdenTrabajo, (orden) => orden.registrosTiempo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo: OrdenTrabajo;

  @Column({ name: 'mecanico_id', type: 'uuid' })
  mecanicoId: string;

  @ManyToOne(() => Usuario, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'mecanico_id' })
  mecanico: Usuario;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_inicio', type: 'timestamp' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamp', nullable: true })
  fechaFin: Date | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
