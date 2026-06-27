import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { DescuentosService } from '../descuentos/descuentos.service';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import type { ActualizarEstadoOrdenTrabajoDto } from './dto/actualizar-estado-orden-trabajo.dto';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import {
  EstadoOrdenTrabajo,
  EstadoPagoOrden,
  OrdenTrabajo,
} from './orden-trabajo.entity';
import { OrdenTrabajoFactory } from './ordenes-trabajo.factory';
import { RegistroTiempo } from './registro-tiempo.entity';

const LIMITE_ORDENES_ACTIVAS = 5;

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly repositorioOrdenesTrabajo: Repository<OrdenTrabajo>,
    @InjectRepository(RegistroTiempo)
    private readonly repositorioRegistrosTiempo: Repository<RegistroTiempo>,
    @InjectRepository(Cliente)
    private readonly repositorioClientes: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly repositorioVehiculos: Repository<Vehiculo>,
    private readonly factory: OrdenTrabajoFactory,
    private readonly descuentosService: DescuentosService,
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
    const hayCupo = await this.validarCuposDisponibles();
    this.validarDatosObligatorios(datosOrden);

    const patenteNormalizada = datosOrden.patenteVehiculo.trim().toUpperCase();
    const vehiculo = await this.repositorioVehiculos.findOne({
      where: { patente: patenteNormalizada },
      relations: ['cliente'],
    });

    if (!vehiculo) {
      throw new NotFoundException(
        'No existe un vehiculo registrado con esa patente',
      );
    }

    const cliente = vehiculo.cliente;
    const estadoInicial = hayCupo ? EstadoOrdenTrabajo.Pendiente : EstadoOrdenTrabajo.EnEspera;
    const orden = this.factory.crearConEstadoInicial(datosOrden, cliente, vehiculo, estadoInicial);

    this.aplicarPresupuesto(orden, datosOrden, cliente, vehiculo);

    const ordenGuardada = await this.repositorioOrdenesTrabajo.save(orden);

    return this.convertirARespuesta(ordenGuardada);
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

  private async validarCuposDisponibles(): Promise<boolean> {
    const ordenesActivas = await this.repositorioOrdenesTrabajo.count({
      where: {
        estado: In([
          EstadoOrdenTrabajo.Pendiente,
          EstadoOrdenTrabajo.EnRevision,
          EstadoOrdenTrabajo.EnProceso,
        ]),
      },
    });

    return ordenesActivas < LIMITE_ORDENES_ACTIVAS;
  }

  async buscarListaEspera(): Promise<OrdenTrabajoRespuestaDto[]> {
    const ordenes = await this.repositorioOrdenesTrabajo.find({
      where: { estado: EstadoOrdenTrabajo.EnEspera },
      order: { creadoEn: 'ASC' },
      relations: ['cliente', 'vehiculo'],
    });

    return ordenes.map((orden, index) => ({
      ...this.convertirARespuesta(orden),
      prioridad: index < 3,
    }));
  }

  async activarDesdeEspera(id: number): Promise<OrdenTrabajoRespuestaDto> {
    const orden = await this.repositorioOrdenesTrabajo.findOne({
      where: { id },
      relations: ['cliente', 'vehiculo'],
    });

    if (!orden) {
      throw new NotFoundException('No existe una orden de trabajo con ese id');
    }

    if (orden.estado !== EstadoOrdenTrabajo.EnEspera) {
      throw new BadRequestException('La orden no esta en la lista de espera');
    }

    const hayCupo = await this.validarCuposDisponibles();
    if (!hayCupo) {
      throw new BadRequestException('No hay cupos disponibles. Finaliza otra orden primero.');
    }

    orden.estado = EstadoOrdenTrabajo.Pendiente;
    const ordenActualizada = await this.repositorioOrdenesTrabajo.save(orden);

    return this.convertirARespuesta(ordenActualizada);
  }

  async iniciarTiempoTrabajo(
    ordenId: number,
    mecanicoId: string,
    descripcion?: string,
  ): Promise<RegistroTiempo> {
    const orden = await this.repositorioOrdenesTrabajo.findOne({
      where: { id: ordenId },
    });

    if (!orden) {
      throw new NotFoundException('No existe una orden de trabajo con ese id');
    }

    if (orden.mecanicoAsignado !== mecanicoId) {
      throw new ForbiddenException(
        'No puedes registrar tiempos en una orden que no tienes asignada',
      );
    }

    // Verificar que el mecánico no tenga otra tarea activa
    const tareaActiva = await this.repositorioRegistrosTiempo.findOne({
      where: {
        mecanicoId: mecanicoId,
        fechaFin: null as any,
      },
    });

    if (tareaActiva) {
      throw new ConflictException(
        `Ya tienes una tarea en curso (Orden ID: ${tareaActiva.ordenTrabajoId}). Detenla antes de iniciar una nueva.`,
      );
    }

    const nuevoRegistro = this.repositorioRegistrosTiempo.create({
      ordenTrabajoId: ordenId,
      mecanicoId: mecanicoId,
      descripcion,
      fechaInicio: new Date(),
    });

    return this.repositorioRegistrosTiempo.save(nuevoRegistro);
  }

  async detenerTiempoTrabajo(
    ordenId: number,
    mecanicoId: string,
  ): Promise<RegistroTiempo> {
    const tareaActiva = await this.repositorioRegistrosTiempo.findOne({
      where: {
        ordenTrabajoId: ordenId,
        mecanicoId: mecanicoId,
        fechaFin: null as any,
      },
    });

    if (!tareaActiva) {
      throw new NotFoundException(
        'No tienes ninguna tarea activa en esta orden de trabajo',
      );
    }

    tareaActiva.fechaFin = new Date();
    return this.repositorioRegistrosTiempo.save(tareaActiva);
  }

  async obtenerHistorialTiempos(ordenId: number) {
    const historial = await this.repositorioRegistrosTiempo.find({
      where: { ordenTrabajoId: ordenId },
      order: { fechaInicio: 'ASC' },
      relations: ['mecanico'],
    });

    let tiempoTotalMinutos = 0;
    historial.forEach((registro) => {
      if (registro.fechaFin) {
        const diffMs = registro.fechaFin.getTime() - registro.fechaInicio.getTime();
        tiempoTotalMinutos += Math.floor(diffMs / 60000);
      } else {
        // Si está en curso, sumamos hasta ahora
        const diffMs = new Date().getTime() - registro.fechaInicio.getTime();
        tiempoTotalMinutos += Math.floor(diffMs / 60000);
      }
    });

    return {
      historial: historial.map((reg) => ({
        id: reg.id,
        mecanico: reg.mecanico.nombre,
        descripcion: reg.descripcion,
        fechaInicio: reg.fechaInicio,
        fechaFin: reg.fechaFin,
        minutosTrabajados: reg.fechaFin 
          ? Math.floor((reg.fechaFin.getTime() - reg.fechaInicio.getTime()) / 60000)
          : Math.floor((new Date().getTime() - reg.fechaInicio.getTime()) / 60000),
      })),
      tiempoTotalMinutos,
    };
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
  ) {
    const costoManoObra = this.normalizarMonto(datosOrden.costoManoObra);
    const costoRepuestos = this.normalizarMonto(datosOrden.costoRepuestos);
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
