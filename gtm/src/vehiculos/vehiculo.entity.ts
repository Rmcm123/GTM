import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'vehiculos' })
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patente: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column('integer')
  ano: number;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  kilometraje?: number;

  @Column({ name: 'cliente_id', type: 'uuid' })
  cliente_id: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
