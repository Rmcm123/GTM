import { fetchAutenticado } from './fetchAutenticado';
import type { UsuarioSesion } from './sesionApi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function obtenerPerfil(): Promise<UsuarioSesion> {
  const respuesta = await fetchAutenticado(`${API_URL}/auth/perfil`);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? 'No se pudo validar la sesion');
  }

  return respuesta.json() as Promise<UsuarioSesion>;
}
