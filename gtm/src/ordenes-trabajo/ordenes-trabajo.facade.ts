import { Injectable } from '@nestjs/common';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

/**
 * Facade para orquestar operaciones complejas relacionadas con órdenes de trabajo
 * Coordina múltiples servicios para proporcionar una interfaz simplificada
 */
@Injectable()
export class OrdenesTrabajoFacade {
  constructor(
    private readonly ordenesService: OrdenesTrabajoService,
  ) {}

  /**
   * Crea una orden de trabajo de forma simplificada
   * Usa el servicio interno para toda la validación y creación
   * @param datosOrden - Datos para crear la orden
   * @returns Orden creada con toda su información
   */
  async crearOrden(
    datosOrden: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesService.crear(datosOrden);
  }

  /**
   * Obtiene todas las órdenes de trabajo
   * @returns Lista de todas las órdenes
   */
  async obtenerOrdenes(): Promise<OrdenTrabajoRespuestaDto[]> {
    return this.ordenesService.buscarTodas();
  }

  /**
   * Obtiene una orden específica por ID
   * @param id - ID de la orden
   * @returns Orden encontrada
   */
  async obtenerOrden(id: number): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesService.buscarPorId(id);
  }

  /**
   * Actualiza el estado de una orden
   * @param id - ID de la orden
   * @param nuevoEstado - Nuevo estado
   * @returns Orden actualizada
   */
  async actualizarEstado(
    id: number,
    nuevoEstado: string,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesService.actualizarEstado(id, { estado: nuevoEstado as any });
  }
}
