import { Injectable } from '@nestjs/common';
import type { Cliente } from '../clientes/cliente.entity';
import type { Vehiculo } from '../vehiculos/vehiculo.entity';
import { DescuentoClienteRegularStrategy } from './estrategias/descuento-cliente-regular.strategy';
import { DescuentoMarcaStrategy } from './estrategias/descuento-marca.strategy';
import { DescuentoMembresiaStrategy } from './estrategias/descuento-membresia.strategy';
import type {
  EstrategiaDescuento,
  ResultadoDescuento,
} from './estrategias/estrategia-descuento.interface';

@Injectable()
export class DescuentosService {
  private readonly estrategias: EstrategiaDescuento[];

  constructor(
    descuentoMarca: DescuentoMarcaStrategy,
    descuentoClienteRegular: DescuentoClienteRegularStrategy,
    descuentoMembresia: DescuentoMembresiaStrategy,
  ) {
    this.estrategias = [
      descuentoMarca,
      descuentoClienteRegular,
      descuentoMembresia,
    ];
  }

  calcularMejorDescuento(
    cliente: Cliente,
    vehiculo: Vehiculo,
  ): ResultadoDescuento {
    const descuentos = this.estrategias.map((estrategia) =>
      estrategia.calcular({ cliente, vehiculo }),
    );

    return descuentos.reduce<ResultadoDescuento>(
      (mejorDescuento, descuentoActual) =>
        descuentoActual.porcentaje > mejorDescuento.porcentaje
          ? descuentoActual
          : mejorDescuento,
      { porcentaje: 0, motivo: 'Sin descuento' },
    );
  }
}
