import type { Cliente } from '../../clientes/cliente.entity';
import type { Vehiculo } from '../../vehiculos/vehiculo.entity';

export type ContextoDescuento = {
  cliente: Cliente;
  vehiculo: Vehiculo;
};

export type ResultadoDescuento = {
  porcentaje: number;
  motivo: string;
};

export interface EstrategiaDescuento {
  calcular(contexto: ContextoDescuento): ResultadoDescuento;
}
