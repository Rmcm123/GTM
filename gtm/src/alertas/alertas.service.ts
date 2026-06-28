import { Injectable } from '@nestjs/common';
import { InventarioService } from '../inventario/inventario.service';
import type { AlertaStockBajo } from '../inventario/observadores/evento-stock-inventario';

export type AlertaSistema = {
  tipo: 'stock_bajo' | 'auditoria';
  prioridad: 'alta' | 'media' | 'baja';
  mensaje: string;
  datos: Record<string, any>;
  creadoEn: string;
};

@Injectable()
export class AlertasService {
  constructor(private readonly inventarioService: InventarioService) {}

  async obtenerTodas(): Promise<AlertaSistema[]> {
    const alertasStock = await this.obtenerAlertasStockBajo();

    const todasLasAlertas: AlertaSistema[] = [...alertasStock];

    // Ordenar por prioridad (alta primero) y luego por fecha
    todasLasAlertas.sort((a, b) => {
      const prioridadOrden = { alta: 0, media: 1, baja: 2 };
      const difPrioridad =
        prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      if (difPrioridad !== 0) return difPrioridad;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });

    return todasLasAlertas;
  }

  private async obtenerAlertasStockBajo(): Promise<AlertaSistema[]> {
    const alertas: AlertaStockBajo[] =
      await this.inventarioService.obtenerAlertasStockBajo();

    return alertas.map((alerta) => ({
      tipo: 'stock_bajo' as const,
      prioridad: this.calcularPrioridadStock(alerta),
      mensaje: alerta.mensaje,
      datos: {
        repuestoId: alerta.repuestoId,
        nombre: alerta.nombre,
        stock: alerta.stock,
        minimo: alerta.minimo,
      },
      creadoEn: alerta.creadoEn,
    }));
  }

  private calcularPrioridadStock(
    alerta: AlertaStockBajo,
  ): 'alta' | 'media' | 'baja' {
    if (alerta.stock === 0) return 'alta';
    if (alerta.stock <= alerta.minimo / 2) return 'media';
    return 'baja';
  }
}
