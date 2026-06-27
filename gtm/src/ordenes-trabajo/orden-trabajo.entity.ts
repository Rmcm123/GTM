import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Pago } from '../pagos/pago.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { RegistroTiempo } from './registro-tiempo.entity';

export enum EstadoOrdenTrabajo {
  Pendiente = 'Pendiente',
  EnRevision = 'En revision',
  EnProceso = 'En proceso',
  Finalizada = 'Finalizada',
  Entregada = 'Entregada',
  Cancelada = 'Cancelada',
  EnEspera = 'En espera',
}

export enum EstadoPagoOrden {
  SinPago = 'Sin pago',
  AdelantoPagado = 'Adelanto pagado',
  Pagada = 'Pagada',
}

@Entity({ name: 'ordenes_trabajo' })
export class OrdenTrabajo {
  @PrimaryGeneratedColumn('increment')
  id: number;

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

  @Column({ default: 0, name: 'costo_mano_obra', type: 'int' })
  costoManoObra: number;

  @Column({ default: 0, name: 'costo_repuestos', type: 'int' })
  costoRepuestos: number;

  @Column({ default: 0, type: 'int' })
  subtotal: number;

  @Column({ default: 0, name: 'porcentaje_descuento', type: 'float' })
  porcentajeDescuento: number;

  @Column({ default: 0, name: 'monto_descuento', type: 'int' })
  montoDescuento: number;

  @Column({ default: 'Sin descuento', name: 'motivo_descuento' })
  motivoDescuento: string;

  @Column({ default: 0, type: 'int' })
  total: number;

  @Column({ default: 0, name: 'adelanto_requerido', type: 'int' })
  adelantoRequerido: number;

  @Column({ default: 0, name: 'total_pagado', type: 'int' })
  totalPagado: number;

  @Column({ default: 0, name: 'saldo_pendiente', type: 'int' })
  saldoPendiente: number;

  @Column({
    enum: EstadoPagoOrden,
    default: EstadoPagoOrden.SinPago,
    name: 'estado_pago',
    type: 'enum',
  })
  estadoPago: EstadoPagoOrden;

  @OneToMany(() => Pago, (pago) => pago.ordenTrabajo)
  pagos: Pago[];

  @OneToMany(() => RegistroTiempo, (registro) => registro.ordenTrabajo)
  registrosTiempo: RegistroTiempo[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
