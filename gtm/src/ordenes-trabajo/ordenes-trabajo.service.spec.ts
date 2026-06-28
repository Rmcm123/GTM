import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import {
  OrdenTrabajo,
  EstadoOrdenTrabajo,
  EstadoPagoOrden,
} from './orden-trabajo.entity';
import { RegistroTiempo } from './registro-tiempo.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { OrdenTrabajoFactory } from './ordenes-trabajo.factory';
import { DescuentosService } from '../descuentos/descuentos.service';
import { InventarioService } from '../inventario/inventario.service';

// --- Mocks BASE para CRUD ---
const crearClienteMock = (): Cliente =>
  ({
    id: 'c-uuid-1',
    rut: '12345678-9',
    nombre: 'Juan Perez',
    telefono: '+56912345678',
    correo: 'juan@test.com',
    vehiculos: [],
    ordenesTrabajo: [],
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  }) as Cliente;

const crearVehiculoMock = (): Vehiculo => ({
  id: 'v-uuid-1',
  patente: 'ABCD12',
  marca: 'Toyota',
  modelo: 'Corolla',
  año: 2020,
  clienteId: 'c-uuid-1',
  cliente: crearClienteMock(),
  ordenesTrabajo: [],
  creadoEn: new Date(),
  actualizadoEn: new Date(),
});

const crearOrdenMock = (overrides: Partial<OrdenTrabajo> = {}): OrdenTrabajo =>
  ({
    id: 1,
    clienteId: 'c-uuid-1',
    cliente: crearClienteMock(),
    vehiculoId: 'v-uuid-1',
    vehiculo: crearVehiculoMock(),
    tipoServicio: 'Mantencion preventiva',
    diagnosticoInicial: 'Cambio de aceite',
    mecanicoAsignado: 'Carlos',
    estado: EstadoOrdenTrabajo.Pendiente,
    fechaIngreso: '2026-06-28',
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    ...overrides,
  }) as OrdenTrabajo;

// --- Mocks BASE para Reglas de Negocio ---
function crearOrdenBase(datos: Partial<OrdenTrabajo> = {}): OrdenTrabajo {
  return {
    adelantoRequerido: 40000,
    cliente: { nombre: 'Cliente Demo', rut: '11111111-1' },
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
    save: jest.fn().mockImplementation((entidad) => Promise.resolve(entidad)),
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
    save: jest.fn().mockImplementation((entidad) => Promise.resolve(entidad)),
  };
  const manager = {
    getRepository: jest.fn().mockReturnValue(repositorioOrdenesTrabajo),
  };
  const dataSource = {
    transaction: jest.fn((callback: (manager: any) => any) =>
      Promise.resolve(callback(manager)),
    ),
  };
  const descuentosService = {
    calcularMejorDescuento: jest
      .fn()
      .mockReturnValue({ motivo: 'Sin descuento', porcentaje: 0 }),
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
  describe('CRUD (Pruebas unitarias)', () => {
    let service: OrdenesTrabajoService;
    let repoOrdenes: Record<string, jest.Mock>;
    let repoClientes: Record<string, jest.Mock>;
    let repoVehiculos: Record<string, jest.Mock>;
    let factory: Record<string, jest.Mock>;
    let dataSource: Record<string, jest.Mock>;

    beforeEach(async () => {
      repoOrdenes = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn((entidad) => Promise.resolve(entidad)),
        count: jest.fn().mockResolvedValue(0),
      };
      repoClientes = { findOne: jest.fn() };
      repoVehiculos = { findOne: jest.fn() };
      factory = {
        crearDesdeDto: jest.fn().mockReturnValue(crearOrdenMock()),
        crearConEstadoInicial: jest.fn().mockReturnValue(crearOrdenMock()),
      };
      dataSource = {
        transaction: jest.fn((cb: (manager: any) => any) =>
          Promise.resolve(
            cb({
              getRepository: (entidad: any) => {
                if (entidad === Vehiculo) return repoVehiculos;
                return repoOrdenes;
              },
            }),
          ),
        ),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OrdenesTrabajoService,
          { provide: getRepositoryToken(OrdenTrabajo), useValue: repoOrdenes },
          { provide: getRepositoryToken(RegistroTiempo), useValue: {} },
          { provide: getRepositoryToken(Usuario), useValue: {} },
          { provide: getRepositoryToken(Cliente), useValue: repoClientes },
          { provide: getRepositoryToken(Vehiculo), useValue: repoVehiculos },
          { provide: OrdenTrabajoFactory, useValue: factory },
          {
            provide: DescuentosService,
            useValue: {
              calcularMejorDescuento: jest
                .fn()
                .mockReturnValue({ porcentaje: 0, motivo: '' }),
            },
          },
          {
            provide: InventarioService,
            useValue: {
              calcularCostoRepuestosConManager: jest.fn().mockResolvedValue(0),
              registrarSalidasPorOrdenConManager: jest.fn(),
            },
          },
          { provide: DataSource, useValue: dataSource },
        ],
      }).compile();

      service = module.get<OrdenesTrabajoService>(OrdenesTrabajoService);
    });

    it('debe retornar lista de ordenes mapeadas', async () => {
      repoOrdenes.find.mockResolvedValue([crearOrdenMock()]);
      const resultado = await service.buscarTodas();
      expect(resultado).toHaveLength(1);
    });

    it('debe retornar orden si existe por id', async () => {
      repoOrdenes.findOne.mockResolvedValue(crearOrdenMock());
      const resultado = await service.buscarPorId(1);
      expect(resultado.id).toBe(1);
    });

    it('debe crear orden exitosamente', async () => {
      const vehiculoConCliente = crearVehiculoMock();
      repoVehiculos.findOne.mockResolvedValue(vehiculoConCliente);
      repoOrdenes.save.mockResolvedValue(crearOrdenMock());
      const resultado = await service.crear({
        patenteVehiculo: 'ABCD12',
        tipoServicio: 'Mantencion preventiva',
        diagnosticoInicial: 'Cambio de aceite',
        fechaIngreso: '2026-06-28',
      });
      expect(resultado.tipoServicio).toBe('Mantencion preventiva');
    });
  });

  describe('Reglas de Negocio (Estados y Pagos)', () => {
    it('no permite pasar a En proceso sin pagar el adelanto requerido', async () => {
      const orden = crearOrdenBase({
        adelantoRequerido: 40000,
        totalPagado: 20000,
      });
      const { service } = crearService(orden);
      await expect(
        service.actualizarEstado(1, { estado: EstadoOrdenTrabajo.EnProceso }),
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
        expect.objectContaining({ estado: EstadoOrdenTrabajo.EnProceso }),
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
        service.actualizarEstado(1, { estado: EstadoOrdenTrabajo.Entregada }),
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
        service.actualizarEstado(1, { estado: EstadoOrdenTrabajo.Entregada }),
      ).rejects.toThrow('debe estar Finalizada');
    });

    it('permite entregar una orden finalizada y sin saldo pendiente', async () => {
      const orden = crearOrdenBase({
        estado: EstadoOrdenTrabajo.Finalizada,
        estadoPago: EstadoPagoOrden.Pagada,
        saldoPendiente: 0,
        totalPagado: 100000,
      });
      const { service } = crearService(orden);
      const respuesta = await service.actualizarEstado(1, {
        estado: EstadoOrdenTrabajo.Entregada,
      });
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
      const { inventarioService, service } = crearServiceParaRepuestos(orden);
      const respuesta = await service.agregarRepuestos(1, {
        repuestos: [{ cantidad: 1, nombre: 'Filtro de aire' }],
      });
      expect(
        inventarioService.registrarSalidasPorOrdenConManager,
      ).toHaveBeenCalled();
      expect(respuesta.saldoPendiente).toBe(85000);
    });
  });
});
