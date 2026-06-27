import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { DescuentosService } from '../descuentos/descuentos.service';
import { InventarioService } from '../inventario/inventario.service';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import type { ActualizarEstadoOrdenTrabajoDto } from './dto/actualizar-estado-orden-trabajo.dto';
import type { AgregarRepuestosOrdenTrabajoDto } from './dto/agregar-repuestos-orden-trabajo.dto';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import {
  EstadoOrdenTrabajo,
  EstadoPagoOrden,
  OrdenTrabajo,
} from './orden-trabajo.entity';
import { OrdenTrabajoFactory } from './ordenes-trabajo.factory';

const LIMITE_ORDENES_ACTIVAS = 5;

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly repositorioOrdenesTrabajo: Repository<OrdenTrabajo>,
    @InjectRepository(Cliente)
    private readonly repositorioClientes: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly repositorioVehiculos: Repository<Vehiculo>,
    private readonly factory: OrdenTrabajoFactory,
    private readonly descuentosService: DescuentosService,
    private readonly inventarioService: InventarioService,
    private readonly dataSource: DataSource,
  ) {}

  async buscarTodas(): Promise<OrdenTrabajoRespuestaDto[]> {
    const ordenes = await this.repositorioOrdenesTrabajo.find({
      order: { creadoEn: 'DESC' },
      relations: ['cliente', 'vehiculo'],
    });

    return ordenes.map((orden) => this.convertirARespuesta(orden));
  }

  async buscarPorId(id: number): Promise<OrdenTrabajoRespuestaDto> {
    const orden = await this.repositorioOrdenesTrabajo.findOne({
      where: { id },
      relations: ['cliente', 'vehiculo'],
    });

    if (!orden) {
      throw new NotFoundException('No existe una orden de trabajo con ese id');
    }

    return this.convertirARespuesta(orden);
  }

  async crear(
    datosOrden: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    this.validarDatosObligatorios(datosOrden);

    return this.dataSource.transaction(async (manager) => {
      const repositorioOrdenesTrabajo = manager.getRepository(OrdenTrabajo);
      const repositorioVehiculos = manager.getRepository(Vehiculo);

      await this.validarCuposDisponiblesConRepositorio(
        repositorioOrdenesTrabajo,
      );

      const patenteNormalizada = datosOrden.patenteVehiculo
        .trim()
        .toUpperCase();
      const vehiculo = await repositorioVehiculos.findOne({
        where: { patente: patenteNormalizada },
        relations: ['cliente'],
      });

      if (!vehiculo) {
        throw new NotFoundException(
          'No existe un vehiculo registrado con esa patente',
        );
      }

      const cliente = vehiculo.cliente;
      const orden = this.factory.crearDesdeDto(datosOrden, cliente, vehiculo);
      const costoRepuestosCalculado =
        await this.inventarioService.calcularCostoRepuestosConManager(
          manager,
          datosOrden.repuestos,
        );

      this.aplicarPresupuesto(
        orden,
        datosOrden,
        cliente,
        vehiculo,
        costoRepuestosCalculado,
      );

      const ordenGuardada = await repositorioOrdenesTrabajo.save(orden);
      await this.inventarioService.registrarSalidasPorOrdenConManager(
        manager,
        ordenGuardada.id,
        datosOrden.repuestos,
      );

      return this.convertirARespuesta(ordenGuardada);
    });
  }

  async actualizarEstado(
    id: number,
    datosActualizacion: ActualizarEstadoOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    const orden = await this.repositorioOrdenesTrabajo.findOne({
      where: { id },
      relations: ['cliente', 'vehiculo'],
    });

    if (!orden) {
      throw new NotFoundException('No existe una orden de trabajo con ese id');
    }

    if (
      orden.estado === EstadoOrdenTrabajo.Finalizada &&
      datosActualizacion.estado !== EstadoOrdenTrabajo.Entregada
    ) {
      throw new BadRequestException(
        'Esta orden ya fue finalizada. Solo puede cambiar a Entregada.',
      );
    }

    if (!datosActualizacion?.estado) {
      throw new BadRequestException('El estado es obligatorio');
    }

    const estadosValidos = Object.values(EstadoOrdenTrabajo);
    if (!estadosValidos.includes(datosActualizacion.estado)) {
      throw new BadRequestException('El estado indicado no es valido');
    }

    this.validarCambioEstado(orden, datosActualizacion.estado);

    orden.estado = datosActualizacion.estado;
    const ordenActualizada = await this.repositorioOrdenesTrabajo.save(orden);

    return this.convertirARespuesta(ordenActualizada);
  }

  async agregarRepuestos(
    id: number,
    datosRepuestos: AgregarRepuestosOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    if (!datosRepuestos.repuestos || datosRepuestos.repuestos.length === 0) {
      throw new BadRequestException('Debe indicar al menos un repuesto');
    }

    return this.dataSource.transaction(async (manager) => {
      const repositorioOrdenesTrabajo = manager.getRepository(OrdenTrabajo);
      const orden = await repositorioOrdenesTrabajo.findOne({
        where: { id },
        relations: ['cliente', 'vehiculo'],
      });

      if (!orden) {
        throw new NotFoundException(
          'No existe una orden de trabajo con ese id',
        );
      }

      if (
        [
          EstadoOrdenTrabajo.Finalizada,
          EstadoOrdenTrabajo.Entregada,
          EstadoOrdenTrabajo.Cancelada,
        ].includes(orden.estado)
      ) {
        throw new BadRequestException(
          'No se pueden agregar repuestos a una orden cerrada o cancelada',
        );
      }

      const costoAdicional =
        await this.inventarioService.calcularCostoRepuestosConManager(
          manager,
          datosRepuestos.repuestos,
        );

      await this.inventarioService.registrarSalidasPorOrdenConManager(
        manager,
        orden.id,
        datosRepuestos.repuestos,
      );

      orden.costoRepuestos += costoAdicional;
      this.recalcularTotales(orden);

      const ordenActualizada = await repositorioOrdenesTrabajo.save(orden);

      return this.convertirARespuesta(ordenActualizada);
    });
  }

  private async validarCuposDisponibles(): Promise<void> {
    await this.validarCuposDisponiblesConRepositorio(
      this.repositorioOrdenesTrabajo,
    );
  }

  private async validarCuposDisponiblesConRepositorio(
    repositorioOrdenesTrabajo: Repository<OrdenTrabajo>,
  ): Promise<void> {
    const ordenesActivas = await repositorioOrdenesTrabajo.count({
      where: {
        estado: In([
          EstadoOrdenTrabajo.Pendiente,
          EstadoOrdenTrabajo.EnRevision,
          EstadoOrdenTrabajo.EnProceso,
        ]),
      },
    });

    if (ordenesActivas >= LIMITE_ORDENES_ACTIVAS) {
      throw new BadRequestException(
        'No hay cupos disponibles. El limite de 5 ordenes activas ha sido alcanzado.',
      );
    }
  }

  private validarDatosObligatorios(datosOrden: CrearOrdenTrabajoDto) {
    const camposObligatorios = [
      datosOrden.patenteVehiculo,
      datosOrden.tipoServicio,
      datosOrden.diagnosticoInicial,
      datosOrden.fechaIngreso,
    ];

    if (
      camposObligatorios.some((campo) => !campo || campo.trim().length === 0)
    ) {
      throw new BadRequestException(
        'Los datos principales de la orden de trabajo son obligatorios',
      );
    }
  }

  private validarCambioEstado(
    orden: OrdenTrabajo,
    nuevoEstado: EstadoOrdenTrabajo,
  ) {
    if (
      nuevoEstado === EstadoOrdenTrabajo.EnProceso &&
      orden.totalPagado < orden.adelantoRequerido
    ) {
      throw new BadRequestException(
        'La orden no puede pasar a En proceso sin pagar el adelanto requerido del 40%',
      );
    }

    if (
      nuevoEstado === EstadoOrdenTrabajo.Entregada &&
      orden.saldoPendiente > 0
    ) {
      throw new BadRequestException(
        'La orden no puede marcarse como Entregada si existe saldo pendiente',
      );
    }

    if (
      nuevoEstado === EstadoOrdenTrabajo.Entregada &&
      orden.estado !== EstadoOrdenTrabajo.Finalizada
    ) {
      throw new BadRequestException(
        'La orden debe estar Finalizada antes de marcarse como Entregada',
      );
    }
  }

  private aplicarPresupuesto(
    orden: OrdenTrabajo,
    datosOrden: CrearOrdenTrabajoDto,
    cliente: Cliente,
    vehiculo: Vehiculo,
    costoRepuestosCalculado: number,
  ) {
    const costoManoObra = this.normalizarMonto(datosOrden.costoManoObra);
    const costoRepuestos =
      datosOrden.repuestos && datosOrden.repuestos.length > 0
        ? costoRepuestosCalculado
        : this.normalizarMonto(datosOrden.costoRepuestos);
    const subtotal = costoManoObra + costoRepuestos;
    const descuento = this.descuentosService.calcularMejorDescuento(
      cliente,
      vehiculo,
    );
    const montoDescuento = Math.round(subtotal * (descuento.porcentaje / 100));
    const total = Math.max(subtotal - montoDescuento, 0);

    orden.costoManoObra = costoManoObra;
    orden.costoRepuestos = costoRepuestos;
    orden.subtotal = subtotal;
    orden.porcentajeDescuento = descuento.porcentaje;
    orden.montoDescuento = montoDescuento;
    orden.motivoDescuento = descuento.motivo;
    orden.total = total;
    orden.adelantoRequerido = Math.ceil(total * 0.4);
    orden.totalPagado = 0;
    orden.saldoPendiente = total;
    orden.estadoPago = EstadoPagoOrden.SinPago;
  }

  private recalcularTotales(orden: OrdenTrabajo) {
    const subtotal = orden.costoManoObra + orden.costoRepuestos;
    const descuento = this.descuentosService.calcularMejorDescuento(
      orden.cliente,
      orden.vehiculo,
    );
    const montoDescuento = Math.round(subtotal * (descuento.porcentaje / 100));
    const total = Math.max(subtotal - montoDescuento, 0);

    orden.subtotal = subtotal;
    orden.porcentajeDescuento = descuento.porcentaje;
    orden.montoDescuento = montoDescuento;
    orden.motivoDescuento = descuento.motivo;
    orden.total = total;
    orden.adelantoRequerido = Math.ceil(total * 0.4);
    orden.saldoPendiente = Math.max(total - orden.totalPagado, 0);
    orden.estadoPago = this.obtenerEstadoPago(orden);
  }

  private obtenerEstadoPago(orden: OrdenTrabajo): EstadoPagoOrden {
    if (orden.saldoPendiente <= 0) {
      return EstadoPagoOrden.Pagada;
    }

    if (orden.totalPagado >= orden.adelantoRequerido) {
      return EstadoPagoOrden.AdelantoPagado;
    }

    return EstadoPagoOrden.SinPago;
  }

  private normalizarMonto(monto?: number): number {
    if (typeof monto !== 'number' || !Number.isFinite(monto)) {
      return 0;
    }

    if (monto < 0) {
      throw new BadRequestException(
        'Los montos del presupuesto no pueden ser negativos',
      );
    }

    return Math.round(monto);
  }

  private convertirARespuesta(orden: OrdenTrabajo): OrdenTrabajoRespuestaDto {
    return {
      id: orden.id,
      clienteId: orden.clienteId,
      rutCliente: orden.cliente.rut,
      nombreCliente: orden.cliente.nombre,
      vehiculoId: orden.vehiculoId,
      patenteVehiculo: orden.vehiculo.patente,
      vehiculo: `${orden.vehiculo.marca} ${orden.vehiculo.modelo}`.trim(),
      tipoServicio: orden.tipoServicio,
      diagnosticoInicial: orden.diagnosticoInicial,
      mecanicoAsignado: orden.mecanicoAsignado,
      estado: orden.estado,
      fechaIngreso: orden.fechaIngreso,
      año: orden.vehiculo.año,
      kilometraje: orden.vehiculo.kilometraje,
      costoManoObra: orden.costoManoObra,
      costoRepuestos: orden.costoRepuestos,
      subtotal: orden.subtotal,
      porcentajeDescuento: orden.porcentajeDescuento,
      montoDescuento: orden.montoDescuento,
      motivoDescuento: orden.motivoDescuento,
      total: orden.total,
      adelantoRequerido: orden.adelantoRequerido,
      totalPagado: orden.totalPagado,
      saldoPendiente: orden.saldoPendiente,
      estadoPago: orden.estadoPago,
    };
  }
}
