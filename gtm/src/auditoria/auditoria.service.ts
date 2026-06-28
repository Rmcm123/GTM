import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraAuditoria } from './bitacora-auditoria.entity';

export type CrearRegistroAuditoriaDto = {
  accion: string;
  recurso: string;
  descripcion?: string;
  datosEntrada?: Record<string, any>;
  usuario?: string;
  direccionIp?: string;
};

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(BitacoraAuditoria)
    private readonly repositorio: Repository<BitacoraAuditoria>,
  ) {}

  async registrar(
    datos: CrearRegistroAuditoriaDto,
  ): Promise<BitacoraAuditoria> {
    const registro = this.repositorio.create({
      accion: datos.accion,
      recurso: datos.recurso,
      descripcion: datos.descripcion,
      datosEntrada: datos.datosEntrada,
      usuario: datos.usuario ?? 'sistema',
      direccionIp: datos.direccionIp,
    });

    return this.repositorio.save(registro);
  }

  async buscarTodos(limite = 50): Promise<BitacoraAuditoria[]> {
    return this.repositorio.find({
      order: { creadoEn: 'DESC' },
      take: limite,
    });
  }
}
