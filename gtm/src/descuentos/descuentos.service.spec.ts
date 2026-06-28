import { MembresiaCliente, type Cliente } from '../clientes/cliente.entity';
import type { Vehiculo } from '../vehiculos/vehiculo.entity';
import { DescuentosService } from './descuentos.service';
import { DescuentoClienteRegularStrategy } from './estrategias/descuento-cliente-regular.strategy';
import { DescuentoMarcaStrategy } from './estrategias/descuento-marca.strategy';
import { DescuentoMembresiaStrategy } from './estrategias/descuento-membresia.strategy';

function crearCliente(parcial: Partial<Cliente> = {}): Cliente {
  return {
    esRegular: false,
    membresia: MembresiaCliente.Ninguna,
    porcentajeDescuentoRegular: 0,
    ...parcial,
  } as Cliente;
}

function crearVehiculo(parcial: Partial<Vehiculo> = {}): Vehiculo {
  return {
    marca: 'Ford',
    modelo: 'Ranger',
    patente: 'ABCD12',
    ...parcial,
  } as Vehiculo;
}

describe('DescuentosService', () => {
  let service: DescuentosService;

  beforeEach(() => {
    service = new DescuentosService(
      new DescuentoMarcaStrategy(),
      new DescuentoClienteRegularStrategy(),
      new DescuentoMembresiaStrategy(),
    );
  });

  it('aplica descuento por marca Toyota o Mitsubishi', () => {
    const descuento = service.calcularMejorDescuento(
      crearCliente(),
      crearVehiculo({ marca: 'Toyota' }),
    );

    expect(descuento.porcentaje).toBe(5);
    expect(descuento.motivo).toContain('Toyota');
  });

  it('mantiene solo el descuento mas alto y no los acumula', () => {
    const descuento = service.calcularMejorDescuento(
      crearCliente({
        esRegular: true,
        membresia: MembresiaCliente.Oro,
        porcentajeDescuentoRegular: 10,
      }),
      crearVehiculo({ marca: 'Mitsubishi' }),
    );

    expect(descuento.porcentaje).toBe(15);
    expect(descuento.motivo).toBe('Descuento por membresia Oro');
  });

  it('limita el descuento de cliente regular a 10%', () => {
    const descuento = service.calcularMejorDescuento(
      crearCliente({
        esRegular: true,
        porcentajeDescuentoRegular: 30,
      }),
      crearVehiculo(),
    );

    expect(descuento.porcentaje).toBe(10);
    expect(descuento.motivo).toBe('Descuento por cliente regular');
  });
});
