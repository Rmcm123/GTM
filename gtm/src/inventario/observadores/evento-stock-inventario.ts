import type { Repuesto } from '../repuesto.entity';

export type EventoStockInventario = {
  repuesto: Repuesto;
  stockAnterior: number;
  tipoMovimiento: string;
};

export type AlertaStockBajo = {
  repuestoId: string;
  nombre: string;
  stock: number;
  minimo: number;
  mensaje: string;
  creadoEn: string;
};
