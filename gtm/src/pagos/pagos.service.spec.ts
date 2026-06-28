import { BadRequestException } from '@nestjs/common';
import {
  EstadoOrdenTrabajo,
  EstadoPagoOrden,
} from '../ordenes-trabajo/orden-trabajo.entity';
import { MedioPago, TipoPago } from './pago.entity';
import { PagosService } from './pagos.service';

function crearServiceConTransaccion(orden: Record<string, unknown>) {
  const repositorioOrdenesTrabajo = {
    findOne: jest.fn().mockResolvedValue(orden),
    save: jest.fn().mockImplementation(async (entidad) => entidad),
  };
  const repositorioPagos = {
    create: jest.fn().mockImplementation((entidad) => entidad),
    save: jest.fn().mockImplementation(async (entidad) => ({
      id: 'pago-1',
      creadoEn: new Date('2026-06-27T12:00:00.000Z'),
      ...entidad,
    })),
  };
  const dataSource = {
    transaction: jest.fn((callback) =>
      callback({
        getRepository: (entidad: { name: string }) =>
          entidad.name === 'Pago'
            ? repositorioPagos
            : repositorioOrdenesTrabajo,
      }),
    ),
  };

  const service = new PagosService(
    repositorioPagos as never,
    repositorioOrdenesTrabajo as never,
    dataSource as never,
  );

  return { repositorioOrdenesTrabajo, repositorioPagos, service };
}

describe('PagosService', () => {
  it('exige proveedor y referencia cuando el pago es electronico', async () => {
    const { service } = crearServiceConTransaccion({});

    await expect(
      service.registrar({
        medioPago: MedioPago.Electronico,
        monto: 10000,
        ordenTrabajoId: 1,
        tipoPago: TipoPago.Adelanto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza el primer pago si no cubre el adelanto requerido del 40%', async () => {
    const { service } = crearServiceConTransaccion({
      adelantoRequerido: 40000,
      estado: EstadoOrdenTrabajo.Pendiente,
      estadoPago: EstadoPagoOrden.SinPago,
      id: 1,
      saldoPendiente: 100000,
      total: 100000,
      totalPagado: 0,
    });

    await expect(
      service.registrar({
        medioPago: MedioPago.Efectivo,
        monto: 30000,
        ordenTrabajoId: 1,
        tipoPago: TipoPago.Adelanto,
      }),
    ).rejects.toThrow('El primer pago debe cubrir al menos el adelanto');
  });

  it('actualiza saldo y estado de pago cuando registra un pago valido', async () => {
    const orden = {
      adelantoRequerido: 40000,
      estado: EstadoOrdenTrabajo.Pendiente,
      estadoPago: EstadoPagoOrden.SinPago,
      id: 1,
      saldoPendiente: 100000,
      total: 100000,
      totalPagado: 0,
    };
    const { repositorioOrdenesTrabajo, service } =
      crearServiceConTransaccion(orden);

    const respuesta = await service.registrar({
      medioPago: MedioPago.Efectivo,
      monto: 40000,
      ordenTrabajoId: 1,
      tipoPago: TipoPago.Adelanto,
    });

    expect(repositorioOrdenesTrabajo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        estadoPago: EstadoPagoOrden.AdelantoPagado,
        saldoPendiente: 60000,
        totalPagado: 40000,
      }),
    );
    expect(respuesta.saldoPendienteOrden).toBe(60000);
    expect(respuesta.estadoPagoOrden).toBe(EstadoPagoOrden.AdelantoPagado);
  });
});
