import { Injectable } from '@nestjs/common';
import type {
  AlertaStockBajo,
  EventoStockInventario,
} from './evento-stock-inventario';
import type { ObservadorInventario } from './observador-inventario.interface';
import type { Repuesto } from '../repuesto.entity';

@Injectable()
export class StockBajoObservador implements ObservadorInventario {
  private readonly alertasPorRepuesto = new Map<string, AlertaStockBajo>();

  actualizar(evento: EventoStockInventario): void {
    const { repuesto } = evento;

    if (repuesto.minimo <= 0 || repuesto.stock >= repuesto.minimo) {
      this.alertasPorRepuesto.delete(repuesto.id);
      return;
    }

    this.alertasPorRepuesto.set(repuesto.id, {
      repuestoId: repuesto.id,
      nombre: repuesto.nombre,
      stock: repuesto.stock,
      minimo: repuesto.minimo,
      mensaje: `${repuesto.nombre} tiene stock bajo (${repuesto.stock}/${repuesto.minimo})`,
      creadoEn: new Date().toISOString(),
    });
  }

  sincronizarConInventario(repuestos: Repuesto[]): void {
    this.alertasPorRepuesto.clear();

    for (const repuesto of repuestos) {
      this.actualizar({
        repuesto,
        stockAnterior: repuesto.stock,
        tipoMovimiento: 'Revision',
      });
    }
  }

  obtenerAlertas(): AlertaStockBajo[] {
    return Array.from(this.alertasPorRepuesto.values()).sort(
      (a, b) => a.stock - b.stock,
    );
  }
}
