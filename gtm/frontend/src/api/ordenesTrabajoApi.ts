import type { WorkOrder } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type OrdenTrabajoApi = {
  id: number;
  nombreCliente: string;
  patenteVehiculo: string;
  vehiculo: string;
  mecanicoAsignado?: string;
  estado: WorkOrder['status'];
  fechaIngreso: string;
};

export type CrearOrdenTrabajoPayload = {
  rutCliente: string;
  patenteVehiculo: string;
  tipoServicio: string;
  diagnosticoInicial: string;
  mecanicoAsignado?: string;
  fechaIngreso: string;
};

function convertirOrdenApi(orden: OrdenTrabajoApi): WorkOrder {
  return {
    id: `OT-${String(orden.id).padStart(3, '0')}`,
    client: orden.nombreCliente,
    vehicle: `${orden.patenteVehiculo} - ${orden.vehiculo}`,
    mechanic: orden.mecanicoAsignado ?? 'Sin asignar',
    status: orden.estado,
    checkIn: orden.fechaIngreso,
  };
}

export async function obtenerOrdenesTrabajo(): Promise<WorkOrder[]> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo`);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de ordenes');
  }

  const ordenes = (await respuesta.json()) as OrdenTrabajoApi[];

  return ordenes.map((orden) => convertirOrdenApi(orden));
}

export async function crearOrdenTrabajo(orden: CrearOrdenTrabajoPayload): Promise<WorkOrder> {
  const respuesta = await fetch(`${API_URL}/ordenes-trabajo`, {
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
