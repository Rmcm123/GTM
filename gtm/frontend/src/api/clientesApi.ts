import type { Cliente } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function obtenerClientes(): Promise<Cliente[]> {
  const respuesta = await fetch(`${API_URL}/clientes`);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de clientes');
  }

  return respuesta.json();
}
