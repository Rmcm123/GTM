import type { HistorialTiemposResponse, RegistroTiempo, WorkOrder } from '../types';
import { crearHeadersAutenticados } from './sesionApi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type OrdenTrabajoApi = {
  id: number;
  nombreCliente: string;
  patenteVehiculo: string;
  vehiculo: string;
  mecanicoAsignado?: string;
  estado: WorkOrder['status'];
  tipoServicio?: string;
  fechaIngreso: string;
  diagnosticoInicial?: string;
  año?: number;
  kilometraje?: number;
  costoManoObra?: number;
  costoRepuestos?: number;
  subtotal?: number;
  porcentajeDescuento?: number;
  montoDescuento?: number;
  motivoDescuento?: string;
  total?: number;
  adelantoRequerido?: number;
  totalPagado?: number;
  saldoPendiente?: number;
  estadoPago?: string;
  prioridad?: boolean;
};

export type CrearOrdenTrabajoPayload = {
  patenteVehiculo: string;
  tipoServicio: string;
  diagnosticoInicial: string;
  mecanicoAsignado?: string;
  fechaIngreso: string;
  costoManoObra?: number;
  costoRepuestos?: number;
};

function convertirOrdenApi(orden: OrdenTrabajoApi): WorkOrder {
  return {
    id: `OT-${String(orden.id).padStart(3, '0')}`,
    client: orden.nombreCliente,
    vehicle: `${orden.patenteVehiculo} - ${orden.vehiculo}`,
    mechanic: orden.mecanicoAsignado ?? 'Sin asignar',
    status: orden.estado,
    checkIn: orden.fechaIngreso,
    tipoServicio: orden.tipoServicio,
    diagnosticoInicial: orden.diagnosticoInicial,
    año: orden.año,
    kilometraje: orden.kilometraje,
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
    prioridad: orden.prioridad,
  };
}

export async function obtenerOrdenesTrabajo(): Promise<WorkOrder[]> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo`, {
    headers: crearHeadersAutenticados(),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de ordenes');
  }

  const ordenes = (await respuesta.json()) as OrdenTrabajoApi[];

  return ordenes.map((orden) => convertirOrdenApi(orden));
}

export async function crearOrdenTrabajo(
  orden: CrearOrdenTrabajoPayload,
): Promise<WorkOrder> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(orden),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo crear la orden de trabajo');
  }

  return convertirOrdenApi((await respuesta.json()) as OrdenTrabajoApi);
}

export async function actualizarEstadoOrden(
  id: number,
  estado: string,
): Promise<WorkOrder> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo/${id}/estado`, {
    method: 'PATCH',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ estado }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(
      error?.message ?? 'No se pudo actualizar el estado de la orden',
    );
  }

  return convertirOrdenApi((await respuesta.json()) as OrdenTrabajoApi);
}

export async function obtenerListaEspera(): Promise<WorkOrder[]> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo/espera`, {
    headers: crearHeadersAutenticados(),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de espera');
  }

  const ordenes = (await respuesta.json()) as OrdenTrabajoApi[];

  return ordenes.map((orden) => convertirOrdenApi(orden));
}

export async function activarOrdenDesdeEspera(id: number): Promise<WorkOrder> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo/${id}/activar`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo activar la orden');
  }

  return convertirOrdenApi((await respuesta.json()) as OrdenTrabajoApi);
}

export async function iniciarTiempoTrabajo(id: number, descripcion?: string): Promise<RegistroTiempo> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo/${id}/tiempos/iniciar`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ descripcion }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo iniciar el tiempo de trabajo');
  }

  return respuesta.json();
}

export async function detenerTiempoTrabajo(id: number): Promise<RegistroTiempo> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo/${id}/tiempos/detener`, {
    method: 'PATCH',
    headers: crearHeadersAutenticados(),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo detener el tiempo de trabajo');
  }

  return respuesta.json();
}

export async function obtenerHistorialTiempos(id: number): Promise<HistorialTiemposResponse> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo/${id}/tiempos`, {
    headers: crearHeadersAutenticados(),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar el historial de tiempos');
  }

  return respuesta.json();
}
