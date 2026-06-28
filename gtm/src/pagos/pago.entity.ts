import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';

export enum TipoPago {
  Adelanto = 'Adelanto',
  Parcial = 'Parcial',
  Final = 'Final',
}

export enum MedioPago {
  Efectivo = 'Efectivo',
  Electronico = 'Electronico',
}

@Entity({ name: 'pagos' })
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orden_trabajo_id', type: 'int' })
  ordenTrabajoId: number;

  @ManyToOne(() => OrdenTrabajo, (ordenTrabajo) => ordenTrabajo.pagos, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo: OrdenTrabajo;

  @Column({ type: 'int' })
  monto: number;

  @Column({ enum: TipoPago, name: 'tipo_pago', type: 'enum' })
  tipoPago: TipoPago;

  @Column({ enum: MedioPago, name: 'medio_pago', type: 'enum' })
  medioPago: MedioPago;

  @Column({ name: 'proveedor_pago', nullable: true })
  proveedorPago?: string;

  @Column({ name: 'referencia_transaccion', nullable: true })
  referenciaTransaccion?: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
