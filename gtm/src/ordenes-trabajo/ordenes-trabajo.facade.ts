import { Injectable } from '@nestjs/common';
import type { AgregarRepuestosOrdenTrabajoDto } from './dto/agregar-repuestos-orden-trabajo.dto';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import { EstadoOrdenTrabajo } from './orden-trabajo.entity';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

/**
 * Facade para orquestar operaciones relacionadas con ordenes de trabajo.
 * Expone una interfaz simple para el controller y oculta la coordinacion interna.
 */
@Injectable()
export class OrdenesTrabajoFacade {
  constructor(private readonly ordenesService: OrdenesTrabajoService) {}

  async crearOrden(
    datosOrden: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesService.crear(datosOrden);
  }

  async obtenerOrdenes(): Promise<OrdenTrabajoRespuestaDto[]> {
    return this.ordenesService.buscarTodas();
  }

  async obtenerOrden(id: number): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesService.buscarPorId(id);
  }

  async actualizarEstado(
    id: number,
    nuevoEstado: EstadoOrdenTrabajo,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesService.actualizarEstado(id, {
      estado: nuevoEstado,
    });
  }

  async agregarRepuestos(
    id: number,
    datosRepuestos: AgregarRepuestosOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesService.agregarRepuestos(id, datosRepuestos);
  }
}
