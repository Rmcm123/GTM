import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehiculosService } from './vehiculos.service';
import { Vehiculo } from './vehiculo.entity';
import { Cliente } from '../clientes/cliente.entity';

const crearClienteMock = (overrides: Partial<Cliente> = {}): Cliente => ({
  id: 'c-uuid-1',
  rut: '12345678-9',
  nombre: 'Juan Perez',
  telefono: '+56912345678',
  correo: 'juan@test.com',
  vehiculos: [],
  ordenesTrabajo: [],
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  ...overrides,
});

const crearVehiculoMock = (overrides: Partial<Vehiculo> = {}): Vehiculo => ({
  id: 'v-uuid-1',
  patente: 'ABCD12',
  marca: 'Toyota',
  modelo: 'Corolla',
  año: 2020,
  color: 'Blanco',
  kilometraje: 50000,
  clienteId: 'c-uuid-1',
  cliente: crearClienteMock(),
  ordenesTrabajo: [],
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  ...overrides,
});

describe('VehiculosService', () => {
  let service: VehiculosService;
  let repoVehiculos: Record<string, jest.Mock>;
  let repoClientes: Record<string, jest.Mock>;

  beforeEach(async () => {
    repoVehiculos = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((datos: Partial<Vehiculo>) => ({ ...datos }) as Vehiculo),
      save: jest.fn((entidad: Partial<Vehiculo>) =>
        Promise.resolve({ id: 'v-uuid-1', ...entidad } as Vehiculo),
      ),
    };

    repoClientes = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculosService,
        { provide: getRepositoryToken(Vehiculo), useValue: repoVehiculos },
        { provide: getRepositoryToken(Cliente), useValue: repoClientes },
      ],
    }).compile();

    service = module.get<VehiculosService>(VehiculosService);
  });

  describe('buscarTodos', () => {
    it('debe retornar lista de vehiculos mapeados', async () => {
      repoVehiculos.find.mockResolvedValue([crearVehiculoMock()]);

      const resultado = await service.buscarTodos();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].patente).toBe('ABCD12');
      expect(resultado[0].rutCliente).toBe('12345678-9');
    });
  });

  describe('buscarPorCliente', () => {
    it('debe buscar vehiculos por clienteId', async () => {
      repoVehiculos.find.mockResolvedValue([crearVehiculoMock()]);

      const resultado = await service.buscarPorCliente('c-uuid-1');

      expect(resultado).toHaveLength(1);
      expect(repoVehiculos.find).toHaveBeenCalledWith({
        where: { clienteId: 'c-uuid-1' },
        order: { creadoEn: 'DESC' },
        relations: ['cliente'],
      });
    });
  });

  describe('buscarPorRutCliente', () => {
    it('debe buscar por RUT del cliente', async () => {
      repoClientes.findOne.mockResolvedValue(crearClienteMock());
      repoVehiculos.find.mockResolvedValue([crearVehiculoMock()]);

      const resultado = await service.buscarPorRutCliente('12345678-9');

      expect(resultado).toHaveLength(1);
    });

    it('debe lanzar NotFoundException si el cliente no existe', async () => {
      repoClientes.findOne.mockResolvedValue(null);

      await expect(service.buscarPorRutCliente('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('buscarPorPatente', () => {
    it('debe retornar vehiculo si existe', async () => {
      repoVehiculos.findOne.mockResolvedValue(crearVehiculoMock());

      const resultado = await service.buscarPorPatente('ABCD12');

      expect(resultado).not.toBeNull();
      expect(resultado!.patente).toBe('ABCD12');
    });

    it('debe retornar null si no existe', async () => {
      repoVehiculos.findOne.mockResolvedValue(null);

      const resultado = await service.buscarPorPatente('ZZZZ99');

      expect(resultado).toBeNull();
    });
  });

  describe('crear', () => {
    it('debe crear vehiculo exitosamente', async () => {
      repoClientes.findOne.mockResolvedValue(crearClienteMock());
      repoVehiculos.findOne.mockResolvedValue(null);
      const vehiculoGuardado = crearVehiculoMock();
      repoVehiculos.save.mockResolvedValue(vehiculoGuardado);

      const resultado = await service.crear({
        rutCliente: '12345678-9',
        patente: 'ABCD12',
        marca: 'Toyota',
        modelo: 'Corolla',
        año: 2020,
      });

      expect(resultado.patente).toBe('ABCD12');
    });

    it('debe lanzar NotFoundException si el cliente no existe', async () => {
      repoClientes.findOne.mockResolvedValue(null);

      await expect(
        service.crear({
          rutCliente: 'no-existe',
          patente: 'ABCD12',
          marca: 'Toyota',
          modelo: 'Corolla',
          año: 2020,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si la patente ya existe', async () => {
      repoClientes.findOne.mockResolvedValue(crearClienteMock());
      repoVehiculos.findOne.mockResolvedValue(crearVehiculoMock());

      await expect(
        service.crear({
          rutCliente: '12345678-9',
          patente: 'ABCD12',
          marca: 'Toyota',
          modelo: 'Corolla',
          año: 2020,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe lanzar BadRequestException si faltan datos obligatorios', async () => {
      await expect(
        service.crear({
          rutCliente: '',
          patente: 'ABCD12',
          marca: 'Toyota',
          modelo: 'Corolla',
          año: 2020,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el año es invalido', async () => {
      await expect(
        service.crear({
          rutCliente: '12345678-9',
          patente: 'ABCD12',
          marca: 'Toyota',
          modelo: 'Corolla',
          año: 1800,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
