import { Injectable } from '@nestjs/common';
import { MembresiaCliente } from '../../clientes/cliente.entity';
import type {
  ContextoDescuento,
  EstrategiaDescuento,
  ResultadoDescuento,
} from './estrategia-descuento.interface';

const DESCUENTOS_MEMBRESIA: Record<MembresiaCliente, number> = {
  [MembresiaCliente.Ninguna]: 0,
  [MembresiaCliente.Bronce]: 10,
  [MembresiaCliente.Plata]: 12.5,
  [MembresiaCliente.Oro]: 15,
};

@Injectable()
export class DescuentoMembresiaStrategy implements EstrategiaDescuento {
  calcular({ cliente }: ContextoDescuento): ResultadoDescuento {
    const porcentaje = DESCUENTOS_MEMBRESIA[cliente.membresia] ?? 0;

    if (porcentaje <= 0) {
      return { porcentaje: 0, motivo: 'Sin descuento por membresia' };
    }

    return {
      porcentaje,
      motivo: `Descuento por membresia ${cliente.membresia}`,
    };
  }
}
