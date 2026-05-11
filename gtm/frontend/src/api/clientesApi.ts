import type { Cliente } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type CrearClientePayload = Omit<Cliente, 'id'>;

export async function obtenerClientes(): Promise<Cliente[]> {
  // Punto unico para pedir clientes al backend. Si cambia la URL de la API,
  // se actualiza aqui y no en cada componente.
  const respuesta = await fetch(`${API_URL}/clientes`);

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la lista de clientes');
  }

  return respuesta.json();
}

export async function crearCliente(cliente: CrearClientePayload): Promise<Cliente> {
  const respuesta = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cliente),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo registrar el cliente');
  }

  return respuesta.json();
}
export type ActualizarClientePayload = Partial<Omit<CrearClientePayload, 'rut'>>;

export async function actualizarCliente(rut: string, cliente: ActualizarClientePayload): Promise<Cliente> {
  const respuesta = await fetch(`${API_URL}/clientes/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cliente),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.message || 'Error al actualizar el cliente');
  }

  return respuesta.json();
}