import type { UserRole, UsuarioSistema } from '../types';
import { fetchAutenticado } from './fetchAutenticado';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type CrearUsuarioPayload = {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: UserRole;
};

export async function obtenerUsuarios(): Promise<UsuarioSistema[]> {
  const respuesta = await fetchAutenticado(`${API_URL}/usuarios`);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudieron cargar los usuarios');
  }

  return (await respuesta.json()) as UsuarioSistema[];
}

export async function crearUsuario(
  usuario: CrearUsuarioPayload,
): Promise<UsuarioSistema> {
  const respuesta = await fetchAutenticado(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuario),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo crear el usuario');
  }

  return (await respuesta.json()) as UsuarioSistema;
}

export async function actualizarEstadoUsuario(
  usuarioId: string,
  activo: boolean,
): Promise<UsuarioSistema> {
  const respuesta = await fetchAutenticado(
    `${API_URL}/usuarios/${usuarioId}/estado`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activo }),
    },
  );

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo actualizar el usuario');
  }

  return (await respuesta.json()) as UsuarioSistema;
}
