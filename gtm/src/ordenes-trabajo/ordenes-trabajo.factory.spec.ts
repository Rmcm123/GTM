import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdenTrabajoFactory } from './ordenes-trabajo.factory';
import { OrdenTrabajo, EstadoOrdenTrabajo } from './orden-trabajo.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

const crearClienteMock = (): Cliente =>
  ({
    id: 'c-uuid-1',
    rut: '12345678-9',
    nombre: 'Juan Perez',
  }) as Cliente;

const crearVehiculoMock = (): Vehiculo =>
  ({
    id: 'v-uuid-1',
    patente: 'ABCD12',
    marca: 'Toyota',
    modelo: 'Corolla',
  }) as Vehiculo;

describe('OrdenTrabajoFactory', () => {
  let factory: OrdenTrabajoFactory;
  let repositorio: Record<string, jest.Mock>;

  beforeEach(async () => {
    repositorio = {
      create: jest.fn(
        (datos: Partial<OrdenTrabajo>) => ({ ...datos }) as OrdenTrabajo,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenTrabajoFactory,
        { provide: getRepositoryToken(OrdenTrabajo), useValue: repositorio },
      ],
    }).compile();

    factory = module.get<OrdenTrabajoFactory>(OrdenTrabajoFactory);
  });

  describe('crearDesdeDto', () => {
    it('debe crear orden con datos correctos', () => {
      const resultado = factory.crearDesdeDto(
        {
          patenteVehiculo: 'ABCD12',
          tipoServicio: 'Mantencion preventiva',
          diagnosticoInicial: 'Cambio de aceite',
          fechaIngreso: '2026-06-28',
        },
        crearClienteMock(),
        crearVehiculoMock(),
      );

      expect(resultado.tipoServicio).toBe('Mantencion preventiva');
      expect(resultado.estado).toBe(EstadoOrdenTrabajo.Pendiente);
      expect(resultado.clienteId).toBe('c-uuid-1');
      expect(resultado.vehiculoId).toBe('v-uuid-1');
    });

    it('debe asignar mecanico si se proporciona', () => {
      const resultado = factory.crearDesdeDto(
        {
          patenteVehiculo: 'ABCD12',
          tipoServicio: 'Mantencion',
          diagnosticoInicial: 'Test',
          mecanicoAsignado: ' Carlos ',
          fechaIngreso: '2026-06-28',
        },
        crearClienteMock(),
        crearVehiculoMock(),
      );

      expect(resultado.mecanicoAsignado).toBe('Carlos');
    });
  });

  describe('crearConEstadoInicial', () => {
    it('debe crear con estado custom', () => {
      const resultado = factory.crearConEstadoInicial(
        {
          patenteVehiculo: 'ABCD12',
          tipoServicio: 'Mantencion',
          diagnosticoInicial: 'Test',
          fechaIngreso: '2026-06-28',
        },
        crearClienteMock(),
        crearVehiculoMock(),
        EstadoOrdenTrabajo.EnRevision,
      );

      expect(resultado.estado).toBe(EstadoOrdenTrabajo.EnRevision);
    });
  });

  describe('crearVacia', () => {
    it('debe crear orden en estado Pendiente', () => {
      const resultado = factory.crearVacia();

      expect(resultado.estado).toBe(EstadoOrdenTrabajo.Pendiente);
    });
  });
});
