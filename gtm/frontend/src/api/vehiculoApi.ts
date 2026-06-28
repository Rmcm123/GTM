import type { Vehiculo } from '../types';
import { fetchAutenticado } from './fetchAutenticado';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type CrearVehiculoPayload = Omit<Vehiculo, 'id'>;

export async function obtenerVehiculos(): Promise<Vehiculo[]> {
  const respuesta = await fetchAutenticado(`${API_URL}/vehiculos`);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de vehiculos');
  }

  return respuesta.json();
}

export async function crearVehiculo(
  vehiculo: CrearVehiculoPayload,
): Promise<Vehiculo> {
  const respuesta = await fetchAutenticado(`${API_URL}/vehiculos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehiculo),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo registrar el vehiculo');
  }

  return respuesta.json();
}
