import { MedioPago, TipoPago } from '../pago.entity';

export type RegistrarPagoDto = {
  ordenTrabajoId: number;
  monto: number;
  tipoPago: TipoPago;
  medioPago: MedioPago;
  referenciaTransaccion?: string;
};
