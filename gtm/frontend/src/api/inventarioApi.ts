import type { AlertaStockBajo, InventoryItem, StockMovement } from '../types';
import { crearHeadersAutenticados } from './sesionApi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type ActualizarStockPayload = {
  nombre: string;
  categoria?: string;
  minimo?: number;
  precioUnitario?: number;
  stock: number;
  nota?: string;
};

export type RegistrarEntradaPayload = {
  nombre: string;
  categoria?: string;
  minimo?: number;
  precioUnitario?: number;
  cantidad: number;
  nota?: string;
};

export type RegistrarSalidaPayload = {
  nombre: string;
  cantidad: number;
  nota?: string;
};

type InventarioApiItem = {
  id: string;
  nombre: string;
  categoria?: string;
  stock: number;
  minimo: number;
  precioUnitario: number;
};

type InventarioApiMovimiento = {
  nombre: string;
  tipo: StockMovement['type'];
  cantidad: number;
  creadoEn: string;
};

type InventarioApiAlertaStockBajo = {
  repuestoId: string;
  nombre: string;
  stock: number;
  minimo: number;
  mensaje: string;
  creadoEn: string;
};

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CL').format(new Date(fecha));
}

async function verificarRespuesta(respuesta: Response, mensajeError: string) {
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? mensajeError);
  }
}

export async function obtenerInventario(): Promise<InventoryItem[]> {
  const respuesta = await fetch(`${API_URL}/inventario`, {
    headers: crearHeadersAutenticados(),
  });
  await verificarRespuesta(respuesta, 'No se pudo cargar el inventario');
  const data: InventarioApiItem[] = await respuesta.json();

  return data.map((item) => ({
    id: item.id,
    name: item.nombre,
    category: item.categoria ?? 'General',
    stock: item.stock,
    minimum: item.minimo,
    unitPrice: item.precioUnitario,
  }));
}

export async function obtenerMovimientosInventario(): Promise<StockMovement[]> {
  const respuesta = await fetch(`${API_URL}/inventario/movimientos`, {
    headers: crearHeadersAutenticados(),
  });
  await verificarRespuesta(respuesta, 'No se pudieron cargar los movimientos');
  const data: InventarioApiMovimiento[] = await respuesta.json();

  return data.map((movimiento) => ({
    item: movimiento.nombre,
    type: movimiento.tipo,
    quantity: movimiento.cantidad,
    date: formatearFecha(movimiento.creadoEn),
  }));
}

export async function obtenerAlertasStockBajo(): Promise<AlertaStockBajo[]> {
  const respuesta = await fetch(`${API_URL}/inventario/alertas-stock-bajo`, {
    headers: crearHeadersAutenticados(),
  });
  await verificarRespuesta(
    respuesta,
    'No se pudieron cargar las alertas de stock bajo',
  );
  const data: InventarioApiAlertaStockBajo[] = await respuesta.json();

  return data;
}

export async function actualizarStockInventario(
  payload: ActualizarStockPayload,
): Promise<InventoryItem> {
  const respuesta = await fetch(`${API_URL}/inventario/actualizar-stock`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });

  await verificarRespuesta(respuesta, 'No se pudo actualizar el stock');
  const item: InventarioApiItem = await respuesta.json();

  return {
    id: item.id,
    name: item.nombre,
    category: item.categoria ?? 'General',
    stock: item.stock,
    minimum: item.minimo,
    unitPrice: item.precioUnitario,
  };
}

export async function registrarEntradaInventario(
  payload: RegistrarEntradaPayload,
): Promise<InventoryItem> {
  const respuesta = await fetch(`${API_URL}/inventario/entrada`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });

  await verificarRespuesta(respuesta, 'No se pudo registrar la entrada');
  const item: InventarioApiItem = await respuesta.json();

  return {
    id: item.id,
    name: item.nombre,
    category: item.categoria ?? 'General',
    stock: item.stock,
    minimum: item.minimo,
    unitPrice: item.precioUnitario,
  };
}

export async function registrarSalidaInventario(
  payload: RegistrarSalidaPayload,
): Promise<InventoryItem> {
  const respuesta = await fetch(`${API_URL}/inventario/salida`, {
    method: 'POST',
    headers: crearHeadersAutenticados({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });

  await verificarRespuesta(respuesta, 'No se pudo registrar la salida');
  const item: InventarioApiItem = await respuesta.json();

  return {
    id: item.id,
    name: item.nombre,
    category: item.categoria ?? 'General',
    stock: item.stock,
    minimum: item.minimo,
    unitPrice: item.precioUnitario,
  };
}
