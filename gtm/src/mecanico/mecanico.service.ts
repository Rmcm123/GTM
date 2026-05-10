import { Injectable } from "@nestjs/common";
import { Mecanico } from "./mecanico.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class MecanicoService {
    constructor(
        @InjectRepository(Mecanico)
        private readonly repositorioMecanicos: Repository<Mecanico>,
    ) {}

    async crearMecanico(mecanico: Mecanico): Promise<Mecanico> {
        return this.repositorioMecanicos.save(mecanico);
    }

    async obtenerMecanicoPorId(id: string): Promise<Mecanico | null> {
        return this.repositorioMecanicos.findOne({ where: { id } });
    }

    async actualizarMecanico(id: string, datosActualizados: Partial<Mecanico>): Promise<Mecanico | null> {
        const mecanico = await this.obtenerMecanicoPorId(id);
        if (!mecanico) {
            return null;
        }  
        Object.assign(mecanico, datosActualizados);
        return this.repositorioMecanicos.save(mecanico);
    }

    async cambiarEstado(id: string, nuevoEstado: 'disponible' | 'ocupado'): Promise<Mecanico | null> {
        const mecanico = await this.obtenerMecanicoPorId(id);
        if (!mecanico) {
            return null;
        }
        mecanico.estado = nuevoEstado;
        return this.repositorioMecanicos.save(mecanico);
    }

}