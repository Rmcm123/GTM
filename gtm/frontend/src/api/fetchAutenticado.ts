import { renovarSesion } from './autenticacionApi';
import { crearHeadersAutenticados, limpiarSesion } from './sesionApi';

export const EVENTO_SESION_EXPIRADA = 'gtm:sesion-expirada';

type OpcionesFetchAutenticado = RequestInit & {
  headers?: HeadersInit;
};

function unirHeaders(
  headersBase: HeadersInit = {},
  headersExtra: HeadersInit = {},
): HeadersInit {
  return {
    ...headersBase,
    ...headersExtra,
  };
}

async function ejecutarFetch(
  url: string,
  opciones: OpcionesFetchAutenticado = {},
) {
  return fetch(url, {
    ...opciones,
    headers: crearHeadersAutenticados(opciones.headers),
  });
}

export async function fetchAutenticado(
  url: string,
  opciones: OpcionesFetchAutenticado = {},
): Promise<Response> {
  const respuesta = await ejecutarFetch(url, opciones);

  if (respuesta.status !== 401) {
    return respuesta;
  }

  try {
    await renovarSesion();
  } catch {
    limpiarSesion();
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    throw new Error('La sesion expiro. Vuelve a iniciar sesion.');
  }

  return fetch(url, {
    ...opciones,
    headers: unirHeaders(crearHeadersAutenticados(), opciones.headers),
  });
}
