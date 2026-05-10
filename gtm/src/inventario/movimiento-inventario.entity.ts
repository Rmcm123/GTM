import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'movimientos_inventario' })
export class MovimientoInventario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'repuesto_id', type: 'uuid' })
  repuestoId!: string;

  @Column({ type: 'varchar' })
  tipo!: 'Entrada' | 'Salida' | 'Actualizacion';

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ name: 'stock_anterior', type: 'int' })
  stockAnterior!: number;

  @Column({ name: 'stock_nuevo', type: 'int' })
  stockNuevo!: number;

  @Column({ type: 'text', nullable: true })
  nota?: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}
