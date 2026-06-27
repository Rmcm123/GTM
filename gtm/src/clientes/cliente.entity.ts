import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

export enum MembresiaCliente {
  Ninguna = 'Ninguna',
  Bronce = 'Bronce',
  Plata = 'Plata',
  Oro = 'Oro',
}

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

  @Column({ name: 'es_regular', default: false })
  esRegular: boolean;

  @Column({ name: 'porcentaje_descuento_regular', default: 0, type: 'float' })
  porcentajeDescuentoRegular: number;

  @Column({
    enum: MembresiaCliente,
    default: MembresiaCliente.Ninguna,
    type: 'enum',
  })
  membresia: MembresiaCliente;

  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.cliente)
  vehiculos: Vehiculo[];

  @OneToMany(() => OrdenTrabajo, (ordenTrabajo) => ordenTrabajo.cliente)
  ordenesTrabajo: OrdenTrabajo[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
