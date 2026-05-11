import type { EventoStockInventario } from './evento-stock-inventario';

export const OBSERVADORES_INVENTARIO = 'OBSERVADORES_INVENTARIO';

export interface ObservadorInventario {
  actualizar(evento: EventoStockInventario): void;
}
