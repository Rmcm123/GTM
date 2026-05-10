import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

export enum EstadoOrdenTrabajo {
  Pendiente = 'Pendiente',
  EnRevision = 'En revision',
  EnProceso = 'En proceso',
  Finalizada = 'Finalizada',
  Entregada = 'Entregada',
  Cancelada = 'Cancelada',
}

@Entity({ name: 'ordenes_trabajo' })
export class OrdenTrabajo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.ordenesTrabajo, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'vehiculo_id', type: 'uuid' })
  vehiculoId: string;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.ordenesTrabajo, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;

  @Column({ name: 'tipo_servicio' })
  tipoServicio: string;

  @Column({ name: 'diagnostico_inicial', type: 'text' })
  diagnosticoInicial: string;

  @Column({ name: 'mecanico_asignado', nullable: true })
  mecanicoAsignado?: string;

  @Column({
    enum: EstadoOrdenTrabajo,
    default: EstadoOrdenTrabajo.Pendiente,
    type: 'enum',
  })
  estado: EstadoOrdenTrabajo;

  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
