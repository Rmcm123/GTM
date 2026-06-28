import type { SesionAutenticacion } from './sesionApi';
import {
  crearHeadersAutenticados,
  guardarSesion,
  limpiarSesion,
  obtenerRefreshToken,
} from './sesionApi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type LoginPayload = {
  correo: string;
  contrasena: string;
};

async function verificarRespuesta(respuesta: Response, mensajeError: string) {
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? mensajeError);
  }
}

export async function iniciarSesion(
  payload: LoginPayload,
): Promise<SesionAutenticacion> {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  await verificarRespuesta(respuesta, 'No se pudo iniciar sesion');

  const sesion = (await respuesta.json()) as SesionAutenticacion;
  guardarSesion(sesion);

  return sesion;
}

export async function renovarSesion(): Promise<SesionAutenticacion> {
  const refreshToken = obtenerRefreshToken();

  if (!refreshToken) {
    throw new Error('No hay refresh token guardado');
  }

  const respuesta = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  await verificarRespuesta(respuesta, 'No se pudo renovar la sesion');

  const sesion = (await respuesta.json()) as SesionAutenticacion;
  guardarSesion(sesion);

  return sesion;
}

export async function cerrarSesion() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: crearHeadersAutenticados(),
    });
  } finally {
    limpiarSesion();
  }
}
