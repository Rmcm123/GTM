import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'clientes' })
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  nombre: string;

  @Column()
  telefono: string;

  @Column()
  correo: string;

  @Column({ name: 'patente_vehiculo' })
  patenteVehiculo: string;

  @Column()
  vehiculo: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
