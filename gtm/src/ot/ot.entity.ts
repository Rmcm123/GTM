import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'ot'})
export class Ot {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'numero_orden', unique: true })
    numeroOrden!: string;

    @Column({ name: 'fecha_ingreso', type: 'timestamp' })
    fechaIngreso!: Date;

    @Column({ name: 'fecha_promesa_salida', type: 'timestamp', nullable: true })
    fechaPromesaSalida?: Date;

    @Column({ name: 'fecha_salida', type: 'timestamp', nullable: true })
    fechaSalida?: Date;

    @Column({ default: 'pendiente' })
    estado!: 'pendiente' | 'progreso' | 'finalizado' | 'entregado'; 

    @Column({ name: 'cliente_id', type: 'uuid' })
    clienteId!: string;

    @Column({ name: 'mecanico_id', type: 'uuid' })
    mecanicoId!: string;

    @Column({ name: 'vehiculo_id', type: 'uuid' })
    vehiculoId!: string;

    @Column({ type: 'text', nullable: true })
    diagnostico?: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    precioTotal!: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    pagos!: number;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn!: Date;

    @UpdateDateColumn({ name: 'actualizado_en' })
    actualizadoEn!: Date;
}