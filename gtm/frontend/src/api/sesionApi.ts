import type { UserRole } from '../types';

const ACCESS_TOKEN_KEY = 'gtm_access_token';
const REFRESH_TOKEN_KEY = 'gtm_refresh_token';
const USUARIO_KEY = 'gtm_usuario';

export type UsuarioSesion = {
  id: string;
  nombre: string;
  correo: string;
  rol: UserRole;
  activo: boolean;
};

export type SesionAutenticacion = {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioSesion;
};

export function obtenerAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function obtenerRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function guardarSesion(sesion: SesionAutenticacion) {
  localStorage.setItem(ACCESS_TOKEN_KEY, sesion.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, sesion.refreshToken);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(sesion.usuario));
}

export function obtenerUsuarioGuardado(): UsuarioSesion | null {
  const usuarioGuardado = localStorage.getItem(USUARIO_KEY);

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado) as UsuarioSesion;
  } catch {
    limpiarSesion();
    return null;
  }
}

export function limpiarSesion() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export function crearHeadersAutenticados(
  headers: HeadersInit = {},
): HeadersInit {
  const accessToken = obtenerAccessToken();

  if (!accessToken) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${accessToken}`,
  };
}
