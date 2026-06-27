import { EstadoPagoOrden } from '../../ordenes-trabajo/orden-trabajo.entity';
import { MedioPago, TipoPago } from '../pago.entity';

export type PagoRespuestaDto = {
  id: string;
  ordenTrabajoId: number;
  monto: number;
  tipoPago: TipoPago;
  medioPago: MedioPago;
  referenciaTransaccion?: string;
  totalPagadoOrden: number;
  saldoPendienteOrden: number;
  estadoPagoOrden: EstadoPagoOrden;
  creadoEn: Date;
};
