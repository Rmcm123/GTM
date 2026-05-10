import type { InventoryItem, StockMovement } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type ActualizarStockPayload = {
  nombre: string;
  categoria?: string;
  minimo?: number;
  stock: number;
  nota?: string;
};

export type RegistrarEntradaPayload = {
  nombre: string;
  categoria?: string;
  minimo?: number;
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
};

type InventarioApiMovimiento = {
  nombre: string;
  tipo: StockMovement['type'];
  cantidad: number;
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
  const respuesta = await fetch(`${API_URL}/inventario`);
  await verificarRespuesta(respuesta, 'No se pudo cargar el inventario');
  const data: InventarioApiItem[] = await respuesta.json();

  return data.map((item) => ({
    id: item.id,
    name: item.nombre,
    category: item.categoria ?? 'General',
    stock: item.stock,
    minimum: item.minimo,
  }));
}

export async function obtenerMovimientosInventario(): Promise<StockMovement[]> {
  const respuesta = await fetch(`${API_URL}/inventario/movimientos`);
  await verificarRespuesta(respuesta, 'No se pudieron cargar los movimientos');
  const data: InventarioApiMovimiento[] = await respuesta.json();

  return data.map((movimiento) => ({
    item: movimiento.nombre,
    type: movimiento.tipo,
    quantity: movimiento.cantidad,
    date: formatearFecha(movimiento.creadoEn),
  }));
}

export async function actualizarStockInventario(payload: ActualizarStockPayload): Promise<InventoryItem> {
  const respuesta = await fetch(`${API_URL}/inventario/actualizar-stock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  };
}

export async function registrarEntradaInventario(payload: RegistrarEntradaPayload): Promise<InventoryItem> {
  const respuesta = await fetch(`${API_URL}/inventario/entrada`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  };
}

export async function registrarSalidaInventario(payload: RegistrarSalidaPayload): Promise<InventoryItem> {
  const respuesta = await fetch(`${API_URL}/inventario/salida`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  };
}
