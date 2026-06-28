import { Injectable } from '@nestjs/common';
import type {
  ContextoDescuento,
  EstrategiaDescuento,
  ResultadoDescuento,
} from './estrategia-descuento.interface';

@Injectable()
export class DescuentoClienteRegularStrategy implements EstrategiaDescuento {
  calcular({ cliente }: ContextoDescuento): ResultadoDescuento {
    if (!cliente.esRegular || cliente.porcentajeDescuentoRegular <= 0) {
      return { porcentaje: 0, motivo: 'Sin descuento por cliente regular' };
    }

    return {
      porcentaje: Math.min(cliente.porcentajeDescuentoRegular, 10),
      motivo: 'Descuento por cliente regular',
    };
  }
}
