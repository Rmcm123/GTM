import { BadRequestException } from '@nestjs/common';
import {
  EstadoOrdenTrabajo,
  EstadoPagoOrden,
  OrdenTrabajo,
} from './orden-trabajo.entity';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

function crearOrdenBase(datos: Partial<OrdenTrabajo> = {}): OrdenTrabajo {
  return {
    adelantoRequerido: 40000,
    cliente: {
      nombre: 'Cliente Demo',
      rut: '11111111-1',
    },
    clienteId: 'cliente-1',
    costoManoObra: 70000,
    costoRepuestos: 30000,
    diagnosticoInicial: 'Revision general',
    estado: EstadoOrdenTrabajo.Pendiente,
    estadoPago: EstadoPagoOrden.SinPago,
    fechaIngreso: '2026-06-27',
    id: 1,
    mecanicoAsignado: 'Camila Torres',
    montoDescuento: 0,
    motivoDescuento: 'Sin descuento',
    porcentajeDescuento: 0,
    saldoPendiente: 100000,
    subtotal: 100000,
    tipoServicio: 'Mantencion',
    total: 100000,
    totalPagado: 0,
    vehiculo: {
      año: 2020,
      kilometraje: 85000,
      marca: 'Toyota',
      modelo: 'Corolla',
      patente: 'ABCD12',
    },
    vehiculoId: 'vehiculo-1',
    ...datos,
  } as OrdenTrabajo;
}

function crearService(orden: OrdenTrabajo) {
  const repositorioOrdenesTrabajo = {
    findOne: jest.fn().mockResolvedValue(orden),
    save: jest.fn().mockImplementation(async (entidad) => entidad),
  };

  const service = new OrdenesTrabajoService(
    repositorioOrdenesTrabajo as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { repositorioOrdenesTrabajo, service };
}

function crearServiceParaRepuestos(orden: OrdenTrabajo) {
  const repositorioOrdenesTrabajo = {
    findOne: jest.fn().mockResolvedValue(orden),
    save: jest.fn().mockImplementation(async (entidad) => entidad),
  };
  const manager = {
    getRepository: jest.fn().mockReturnValue(repositorioOrdenesTrabajo),
  };
  const dataSource = {
    transaction: jest.fn((callback) => callback(manager)),
  };
  const descuentosService = {
    calcularMejorDescuento: jest.fn().mockReturnValue({
      motivo: 'Sin descuento',
      porcentaje: 0,
    }),
  };
  const inventarioService = {
    calcularCostoRepuestosConManager: jest.fn().mockResolvedValue(25000),
    registrarSalidasPorOrdenConManager: jest.fn().mockResolvedValue(undefined),
  };

  const service = new OrdenesTrabajoService(
    repositorioOrdenesTrabajo as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    descuentosService as never,
    inventarioService as never,
    dataSource as never,
  );

  return {
    descuentosService,
    inventarioService,
    repositorioOrdenesTrabajo,
    service,
  };
}

describe('OrdenesTrabajoService', () => {
  it('no permite pasar a En proceso sin pagar el adelanto requerido', async () => {
    const orden = crearOrdenBase({
      adelantoRequerido: 40000,
      totalPagado: 20000,
    });
    const { service } = crearService(orden);

    await expect(
      service.actualizarEstado(1, {
        estado: EstadoOrdenTrabajo.EnProceso,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('permite pasar a En proceso cuando el adelanto esta pagado', async () => {
    const orden = crearOrdenBase({
      adelantoRequerido: 40000,
      totalPagado: 40000,
    });
    const { repositorioOrdenesTrabajo, service } = crearService(orden);

    const respuesta = await service.actualizarEstado(1, {
      estado: EstadoOrdenTrabajo.EnProceso,
    });

    expect(repositorioOrdenesTrabajo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: EstadoOrdenTrabajo.EnProceso,
      }),
    );
    expect(respuesta.estado).toBe(EstadoOrdenTrabajo.EnProceso);
  });

  it('no permite entregar una orden con saldo pendiente', async () => {
    const orden = crearOrdenBase({
      estado: EstadoOrdenTrabajo.Finalizada,
      saldoPendiente: 50000,
    });
    const { service } = crearService(orden);

    await expect(
      service.actualizarEstado(1, {
        estado: EstadoOrdenTrabajo.Entregada,
      }),
    ).rejects.toThrow('saldo pendiente');
  });

  it('no permite entregar una orden que aun no esta finalizada', async () => {
    const orden = crearOrdenBase({
      estado: EstadoOrdenTrabajo.EnProceso,
      saldoPendiente: 0,
      totalPagado: 100000,
    });
    const { service } = crearService(orden);

    await expect(
      service.actualizarEstado(1, {
        estado: EstadoOrdenTrabajo.Entregada,
      }),
    ).rejects.toThrow('debe estar Finalizada');
  });

  it('permite entregar una orden finalizada y sin saldo pendiente', async () => {
    const orden = crearOrdenBase({
      estado: EstadoOrdenTrabajo.Finalizada,
      estadoPago: EstadoPagoOrden.Pagada,
      saldoPendiente: 0,
      totalPagado: 100000,
    });
    const { repositorioOrdenesTrabajo, service } = crearService(orden);

    const respuesta = await service.actualizarEstado(1, {
      estado: EstadoOrdenTrabajo.Entregada,
    });

    expect(repositorioOrdenesTrabajo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: EstadoOrdenTrabajo.Entregada,
      }),
    );
    expect(respuesta.estado).toBe(EstadoOrdenTrabajo.Entregada);
  });

  it('agrega repuestos solicitados y recalcula total y saldo de la orden', async () => {
    const orden = crearOrdenBase({
      costoManoObra: 70000,
      costoRepuestos: 30000,
      saldoPendiente: 60000,
      subtotal: 100000,
      total: 100000,
      totalPagado: 40000,
    });
    const { inventarioService, repositorioOrdenesTrabajo, service } =
      crearServiceParaRepuestos(orden);

    const respuesta = await service.agregarRepuestos(1, {
      repuestos: [{ cantidad: 1, nombre: 'Filtro de aire' }],
    });

    expect(
      inventarioService.registrarSalidasPorOrdenConManager,
    ).toHaveBeenCalledWith(expect.anything(), 1, [
      { cantidad: 1, nombre: 'Filtro de aire' },
    ]);
    expect(repositorioOrdenesTrabajo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        costoRepuestos: 55000,
        saldoPendiente: 85000,
        subtotal: 125000,
        total: 125000,
      }),
    );
    expect(respuesta.saldoPendiente).toBe(85000);
  });
});
