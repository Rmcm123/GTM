import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'mecanicos'})
export class Mecanico {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    rut!: string;

    @Column()
    nombre!: string;

    @Column()
    telefono!: string;

    @Column()
    correo!: string;

    @Column({ default: 'disponible' })
    estado!: string;

    @Column({type : 'simple-array', nullable: true})
    vehiculosAsignados?: string[];

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn!: Date;

    @UpdateDateColumn({ name: 'actualizado_en' })
    actualizadoEn!: Date;
}