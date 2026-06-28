import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { ActualizarEstadoOrdenTrabajoDto } from './dto/actualizar-estado-orden-trabajo.dto';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { OrdenTrabajo, EstadoOrdenTrabajo } from './orden-trabajo.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { OrdenTrabajoFactory } from './ordenes-trabajo.factory';

const crearClienteMock = (): Cliente => ({
  id: 'c-uuid-1',
  rut: '12345678-9',
  nombre: 'Juan Perez',
  telefono: '+56912345678',
  correo: 'juan@test.com',
  vehiculos: [],
  ordenesTrabajo: [],
  creadoEn: new Date(),
  actualizadoEn: new Date(),
});

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

const crearOrdenMock = (
  overrides: Partial<OrdenTrabajo> = {},
): OrdenTrabajo => ({
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
});

describe('OrdenesTrabajoService', () => {
  let service: OrdenesTrabajoService;
  let repoOrdenes: Record<string, jest.Mock>;
  let repoClientes: Record<string, jest.Mock>;
  let repoVehiculos: Record<string, jest.Mock>;
  let factory: Record<string, jest.Mock>;

  beforeEach(async () => {
    repoOrdenes = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((entidad) => Promise.resolve(entidad)),
    };

    repoClientes = { findOne: jest.fn() };
    repoVehiculos = { findOne: jest.fn() };

    factory = {
      crearDesdeDto: jest.fn().mockReturnValue(crearOrdenMock()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesTrabajoService,
        { provide: getRepositoryToken(OrdenTrabajo), useValue: repoOrdenes },
        { provide: getRepositoryToken(Cliente), useValue: repoClientes },
        { provide: getRepositoryToken(Vehiculo), useValue: repoVehiculos },
        { provide: OrdenTrabajoFactory, useValue: factory },
      ],
    }).compile();

    service = module.get<OrdenesTrabajoService>(OrdenesTrabajoService);
  });

  describe('buscarTodas', () => {
    it('debe retornar lista de ordenes mapeadas', async () => {
      repoOrdenes.find.mockResolvedValue([crearOrdenMock()]);

      const resultado = await service.buscarTodas();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipoServicio).toBe('Mantencion preventiva');
      expect(resultado[0].rutCliente).toBe('12345678-9');
    });
  });

  describe('buscarPorId', () => {
    it('debe retornar orden si existe', async () => {
      repoOrdenes.findOne.mockResolvedValue(crearOrdenMock());

      const resultado = await service.buscarPorId(1);

      expect(resultado.id).toBe(1);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repoOrdenes.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('crear', () => {
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
      expect(factory.crearDesdeDto).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el vehiculo no existe', async () => {
      repoVehiculos.findOne.mockResolvedValue(null);

      await expect(
        service.crear({
          patenteVehiculo: 'ZZZZ99',
          tipoServicio: 'Mantencion',
          diagnosticoInicial: 'Test',
          fechaIngreso: '2026-06-28',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si faltan datos', async () => {
      await expect(
        service.crear({
          patenteVehiculo: '',
          tipoServicio: 'Mantencion',
          diagnosticoInicial: 'Test',
          fechaIngreso: '2026-06-28',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('actualizarEstado', () => {
    it('debe actualizar estado exitosamente', async () => {
      const orden = crearOrdenMock();
      repoOrdenes.findOne.mockResolvedValue(orden);
      repoOrdenes.save.mockResolvedValue({
        ...orden,
        estado: EstadoOrdenTrabajo.EnProceso,
      });

      const resultado = await service.actualizarEstado(1, {
        estado: EstadoOrdenTrabajo.EnProceso,
      });

      expect(resultado.estado).toBe(EstadoOrdenTrabajo.EnProceso);
    });

    it('debe lanzar NotFoundException si la orden no existe', async () => {
      repoOrdenes.findOne.mockResolvedValue(null);

      await expect(
        service.actualizarEstado(999, {
          estado: EstadoOrdenTrabajo.EnProceso,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el estado es invalido', async () => {
      repoOrdenes.findOne.mockResolvedValue(crearOrdenMock());

      await expect(
        service.actualizarEstado(1, {
          estado: 'INVALIDO' as EstadoOrdenTrabajo,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si no se envia estado', async () => {
      repoOrdenes.findOne.mockResolvedValue(crearOrdenMock());

      await expect(
        service.actualizarEstado(1, {} as ActualizarEstadoOrdenTrabajoDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
