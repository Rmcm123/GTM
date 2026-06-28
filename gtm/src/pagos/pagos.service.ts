import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  EstadoOrdenTrabajo,
  EstadoPagoOrden,
  OrdenTrabajo,
} from '../ordenes-trabajo/orden-trabajo.entity';
import type { PagoRespuestaDto } from './dto/pago-respuesta.dto';
import type { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { MedioPago, Pago, TipoPago } from './pago.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly repositorioPagos: Repository<Pago>,
    @InjectRepository(OrdenTrabajo)
    private readonly repositorioOrdenesTrabajo: Repository<OrdenTrabajo>,
    private readonly dataSource: DataSource,
  ) {}

  async buscarPorOrden(ordenTrabajoId: number): Promise<PagoRespuestaDto[]> {
    const pagos = await this.repositorioPagos.find({
      where: { ordenTrabajoId },
      order: { creadoEn: 'DESC' },
      relations: ['ordenTrabajo'],
    });

    return pagos.map((pago) => this.convertirARespuesta(pago));
  }

  async registrar(datosPago: RegistrarPagoDto): Promise<PagoRespuestaDto> {
    this.validarDatosPago(datosPago);

    return this.dataSource.transaction(async (manager) => {
      const repositorioOrdenesTrabajo = manager.getRepository(OrdenTrabajo);
      const repositorioPagos = manager.getRepository(Pago);

      const orden = await repositorioOrdenesTrabajo.findOne({
        where: { id: Number(datosPago.ordenTrabajoId) },
      });

      if (!orden) {
        throw new NotFoundException(
          'No existe una orden de trabajo con ese id',
        );
      }

      if (
        orden.estado === EstadoOrdenTrabajo.Entregada ||
        orden.estado === EstadoOrdenTrabajo.Cancelada
      ) {
        throw new BadRequestException(
          'No se pueden registrar pagos en una orden cerrada o cancelada',
        );
      }

      if (orden.saldoPendiente <= 0) {
        throw new BadRequestException('La orden ya se encuentra pagada');
      }

      if (datosPago.monto > orden.saldoPendiente) {
        throw new BadRequestException(
          'El monto del pago no puede superar el saldo pendiente',
        );
      }

      if (
        datosPago.tipoPago === TipoPago.Final &&
        datosPago.monto < orden.saldoPendiente
      ) {
        throw new BadRequestException(
          'El pago final debe cubrir todo el saldo pendiente',
        );
      }

      const totalPagadoAnterior = orden.totalPagado;
      orden.totalPagado += Math.round(datosPago.monto);
      orden.saldoPendiente = Math.max(orden.total - orden.totalPagado, 0);
      orden.estadoPago = this.calcularEstadoPago(orden);

      if (
        totalPagadoAnterior < orden.adelantoRequerido &&
        orden.totalPagado < orden.adelantoRequerido
      ) {
        throw new BadRequestException(
          'El primer pago debe cubrir al menos el adelanto requerido del 40%',
        );
      }

      const pago = repositorioPagos.create({
        ordenTrabajoId: orden.id,
        ordenTrabajo: orden,
        monto: Math.round(datosPago.monto),
        tipoPago: datosPago.tipoPago,
        medioPago: datosPago.medioPago,
        proveedorPago: this.normalizarTextoOpcional(datosPago.proveedorPago),
        referenciaTransaccion: this.normalizarTextoOpcional(
          datosPago.referenciaTransaccion,
        ),
      });

      await repositorioOrdenesTrabajo.save(orden);
      const pagoGuardado = await repositorioPagos.save(pago);

      pagoGuardado.ordenTrabajo = orden;
      return this.convertirARespuesta(pagoGuardado);
    });
  }

  private validarDatosPago(datosPago: RegistrarPagoDto) {
    if (!datosPago?.ordenTrabajoId) {
      throw new BadRequestException('La orden de trabajo es obligatoria');
    }

    if (
      !Number.isFinite(Number(datosPago.monto)) ||
      Number(datosPago.monto) <= 0
    ) {
      throw new BadRequestException('El monto del pago debe ser mayor a cero');
    }

    if (!datosPago.tipoPago) {
      throw new BadRequestException('El tipo de pago es obligatorio');
    }

    if (!datosPago.medioPago) {
      throw new BadRequestException('El medio de pago es obligatorio');
    }

    if (
      datosPago.medioPago === MedioPago.Electronico &&
      (!datosPago.proveedorPago || datosPago.proveedorPago.trim().length === 0)
    ) {
      throw new BadRequestException(
        'El proveedor de pago es obligatorio para pagos electronicos',
      );
    }

    if (
      datosPago.medioPago === MedioPago.Electronico &&
      (!datosPago.referenciaTransaccion ||
        datosPago.referenciaTransaccion.trim().length === 0)
    ) {
      throw new BadRequestException(
        'La referencia de transaccion es obligatoria para pagos electronicos',
      );
    }
  }

  private normalizarTextoOpcional(valor?: string): string | undefined {
    const valorNormalizado = valor?.trim();
    return valorNormalizado && valorNormalizado.length > 0
      ? valorNormalizado
      : undefined;
  }

  private calcularEstadoPago(orden: OrdenTrabajo): EstadoPagoOrden {
    if (orden.saldoPendiente <= 0) {
      return EstadoPagoOrden.Pagada;
    }

    if (orden.totalPagado >= orden.adelantoRequerido) {
      return EstadoPagoOrden.AdelantoPagado;
    }

    return EstadoPagoOrden.SinPago;
  }

  private convertirARespuesta(pago: Pago): PagoRespuestaDto {
    return {
      id: pago.id,
      ordenTrabajoId: pago.ordenTrabajoId,
      monto: pago.monto,
      tipoPago: pago.tipoPago,
      medioPago: pago.medioPago,
      proveedorPago: pago.proveedorPago,
      referenciaTransaccion: pago.referenciaTransaccion,
      totalPagadoOrden: pago.ordenTrabajo.totalPagado,
      saldoPendienteOrden: pago.ordenTrabajo.saldoPendiente,
      estadoPagoOrden: pago.ordenTrabajo.estadoPago,
      creadoEn: pago.creadoEn,
    };
  }
}
