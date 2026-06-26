import type { Vehiculo } from '../types';
import { crearHeadersAutenticados } from './sesionApi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type CrearVehiculoPayload = Omit<Vehiculo, 'id'>;

export async function obtenerVehiculos(): Promise<Vehiculo[]> {
  const respuesta = await fetch(`${API_URL}/vehiculos`, {
    headers: crearHeadersAutenticados(),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de vehículos');
  }

  return respuesta.json();
}

export async function crearVehiculo(
  vehiculo: CrearVehiculoPayload,
): Promise<Vehiculo> {
  const respuesta = await fetch(`${API_URL}/vehiculos`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(vehiculo),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo registrar el vehículo');
  }

  return respuesta.json();
}
