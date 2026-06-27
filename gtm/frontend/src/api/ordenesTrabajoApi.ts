import type { WorkOrder } from '../types';
import { fetchAutenticado } from './fetchAutenticado';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type OrdenTrabajoApi = {
  id: number;
  rutCliente: string;
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
};

export type CrearOrdenTrabajoPayload = {
  patenteVehiculo: string;
  tipoServicio: string;
  diagnosticoInicial: string;
  mecanicoAsignado?: string;
  fechaIngreso: string;
  costoManoObra?: number;
  costoRepuestos?: number;
  repuestos?: RepuestoOrdenPayload[];
};

export type RepuestoOrdenPayload = {
  nombre: string;
  cantidad: number;
};

function convertirOrdenApi(orden: OrdenTrabajoApi): WorkOrder {
  return {
    id: `OT-${String(orden.id).padStart(3, '0')}`,
    client: orden.nombreCliente,
    rutCliente: orden.rutCliente,
    vehicle: `${orden.patenteVehiculo} - ${orden.vehiculo}`,
    patenteVehiculo: orden.patenteVehiculo,
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
  };
}

export async function obtenerOrdenesTrabajo(): Promise<WorkOrder[]> {
  const respuesta = await fetchAutenticado(`${API_URL}/ordenes-trabajo`);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de ordenes');
  }

  const ordenes = (await respuesta.json()) as OrdenTrabajoApi[];

  return ordenes.map((orden) => convertirOrdenApi(orden));
}

export async function crearOrdenTrabajo(
  orden: CrearOrdenTrabajoPayload,
): Promise<WorkOrder> {
  const respuesta = await fetchAutenticado(`${API_URL}/ordenes-trabajo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const respuesta = await fetchAutenticado(
    `${API_URL}/ordenes-trabajo/${id}/estado`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    },
  );

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(
      error?.message ?? 'No se pudo actualizar el estado de la orden',
    );
  }

  return convertirOrdenApi((await respuesta.json()) as OrdenTrabajoApi);
}
