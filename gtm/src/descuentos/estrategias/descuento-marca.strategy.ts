import { Injectable } from '@nestjs/common';
import type {
  ContextoDescuento,
  EstrategiaDescuento,
  ResultadoDescuento,
} from './estrategia-descuento.interface';

const MARCAS_CON_DESCUENTO = ['toyota', 'mitsubishi'];

@Injectable()
export class DescuentoMarcaStrategy implements EstrategiaDescuento {
  calcular({ vehiculo }: ContextoDescuento): ResultadoDescuento {
    const marca = vehiculo.marca.trim().toLowerCase();

    if (!MARCAS_CON_DESCUENTO.includes(marca)) {
      return { porcentaje: 0, motivo: 'Sin descuento por marca' };
    }

    return {
      porcentaje: 5,
      motivo: `Descuento por marca ${vehiculo.marca}`,
    };
  }
}
