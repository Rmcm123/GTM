import { crearHeadersAutenticados } from './sesionApi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type TipoPago = 'Adelanto' | 'Parcial' | 'Final';
export type MedioPago = 'Efectivo' | 'Electronico';

export type RegistrarPagoPayload = {
  ordenTrabajoId: number;
  monto: number;
  tipoPago: TipoPago;
  medioPago: MedioPago;
  referenciaTransaccion?: string;
};

export type PagoRespuesta = {
  id: string;
  ordenTrabajoId: number;
  monto: number;
  tipoPago: TipoPago;
  medioPago: MedioPago;
  referenciaTransaccion?: string;
  totalPagadoOrden: number;
  saldoPendienteOrden: number;
  estadoPagoOrden: string;
  creadoEn: string;
};

export async function registrarPago(
  pago: RegistrarPagoPayload,
): Promise<PagoRespuesta> {
  const respuesta = await fetch(`${API_URL}/pagos`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(pago),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo registrar el pago');
  }

  return (await respuesta.json()) as PagoRespuesta;
}

export async function obtenerPagosPorOrden(
  ordenTrabajoId: number,
): Promise<PagoRespuesta[]> {
  const respuesta = await fetch(`${API_URL}/pagos/orden/${ordenTrabajoId}`, {
    headers: crearHeadersAutenticados(),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudieron cargar los pagos');
  }

  return (await respuesta.json()) as PagoRespuesta[];
}
