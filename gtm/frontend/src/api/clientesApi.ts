import type { Cliente } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function obtenerClientes(): Promise<Cliente[]> {
  // Punto unico para pedir clientes al backend. Si cambia la URL de la API,
  // se actualiza aqui y no en cada componente.
  const respuesta = await fetch(`${API_URL}/clientes`);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de clientes');
  }

  return respuesta.json();
}
