import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import { EstadoOrdenTrabajo, OrdenTrabajo } from './orden-trabajo.entity';

/**
 * Factory para crear instancias de OrdenTrabajo
 * Centraliza la lógica de creación y permite diferentes estrategias de construcción
 */
@Injectable()
export class OrdenTrabajoFactory {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly repositorio: Repository<OrdenTrabajo>,
  ) {}

  /**
   * Crea una orden de trabajo básica a partir del DTO
   * @param datosOrden - Datos del DTO de creación
   * @param cliente - Cliente propietario del vehículo
   * @param vehiculo - Vehículo sobre el cual se abre la orden
   * @returns Nueva instancia de OrdenTrabajo
   */
  crearDesdeDto(
    datosOrden: CrearOrdenTrabajoDto,
    cliente: Cliente,
    vehiculo: Vehiculo,
  ): OrdenTrabajo {
    const orden = this.repositorio.create({
      clienteId: cliente.id,
      cliente,
      vehiculoId: vehiculo.id,
      vehiculo,
      tipoServicio: datosOrden.tipoServicio.trim(),
      diagnosticoInicial: datosOrden.diagnosticoInicial.trim(),
      mecanicoAsignado: datosOrden.mecanicoAsignado?.trim() || undefined,
      fechaIngreso: datosOrden.fechaIngreso,
      estado: EstadoOrdenTrabajo.Pendiente,
    });

    return orden;
  }

  /**
   * Crea una orden de trabajo con estado específico
   * Útil para órdenes que no comienzan en "Pendiente"
   * @param datosOrden - Datos del DTO
   * @param cliente - Cliente
   * @param vehiculo - Vehículo
   * @param estado - Estado inicial de la orden
   * @returns Nueva instancia con estado específico
   */
  crearConEstadoInicial(
    datosOrden: CrearOrdenTrabajoDto,
    cliente: Cliente,
    vehiculo: Vehiculo,
    estado: EstadoOrdenTrabajo,
  ): OrdenTrabajo {
    const orden = this.crearDesdeDto(datosOrden, cliente, vehiculo);
    orden.estado = estado;
    return orden;
  }

  /**
   * Crea una orden vacía (sin cliente ni vehículo)
   * Útil para testing o construcción incremental
   * @returns Nueva instancia vacía
   */
  crearVacia(): OrdenTrabajo {
    return this.repositorio.create({
      estado: EstadoOrdenTrabajo.Pendiente,
    });
  }
}
