import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.entity';

const crearClienteMock = (overrides: Partial<Cliente> = {}): Cliente => ({
  id: 'uuid-1',
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

describe('ClientesService', () => {
  let service: ClientesService;
  let repositorio: Record<string, jest.Mock>;

  beforeEach(async () => {
    repositorio = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((datos: Partial<Cliente>) => ({ ...datos }) as Cliente),
      save: jest.fn((entidad: Partial<Cliente>) =>
        Promise.resolve({ id: 'uuid-1', ...entidad } as Cliente),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        { provide: getRepositoryToken(Cliente), useValue: repositorio },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
  });

  describe('buscarTodos', () => {
    it('debe retornar lista de clientes mapeados', async () => {
      const clientes = [
        crearClienteMock(),
        crearClienteMock({ id: 'uuid-2', rut: '98765432-1' }),
      ];
      repositorio.find.mockResolvedValue(clientes);

      const resultado = await service.buscarTodos();

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        id: 'uuid-1',
        rut: '12345678-9',
        nombre: 'Juan Perez',
        telefono: '+56912345678',
        correo: 'juan@test.com',
      });
      expect(repositorio.find).toHaveBeenCalledWith({
        order: { creadoEn: 'DESC' },
      });
    });

    it('debe retornar lista vacia si no hay clientes', async () => {
      repositorio.find.mockResolvedValue([]);

      const resultado = await service.buscarTodos();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('crear', () => {
    it('debe crear un cliente exitosamente', async () => {
      repositorio.findOne.mockResolvedValue(null);
      const clienteGuardado = crearClienteMock();
      repositorio.save.mockResolvedValue(clienteGuardado);

      const resultado = await service.crear({
        rut: '12345678-9',
        nombre: 'Juan Perez',
        telefono: '+56912345678',
        correo: 'juan@test.com',
      });

      expect(resultado.rut).toBe('12345678-9');
      expect(repositorio.create).toHaveBeenCalled();
      expect(repositorio.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el RUT ya existe', async () => {
      repositorio.findOne.mockResolvedValue(crearClienteMock());

      await expect(
        service.crear({
          rut: '12345678-9',
          nombre: 'Otro',
          telefono: '123',
          correo: 'otro@test.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe lanzar BadRequestException si faltan datos obligatorios', async () => {
      await expect(
        service.crear({
          rut: '',
          nombre: 'Juan',
          telefono: '123',
          correo: 'j@t.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el nombre esta vacio', async () => {
      await expect(
        service.crear({
          rut: '12345678-9',
          nombre: '  ',
          telefono: '123',
          correo: 'j@t.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('actualizar', () => {
    it('debe actualizar campos parciales de un cliente existente', async () => {
      const clienteExistente = crearClienteMock();
      repositorio.findOne.mockResolvedValue(clienteExistente);
      repositorio.save.mockResolvedValue({
        ...clienteExistente,
        nombre: 'Pedro',
      });

      const resultado = await service.actualizar('12345678-9', {
        nombre: 'Pedro',
      });

      expect(resultado.nombre).toBe('Pedro');
    });

    it('debe lanzar BadRequestException si el cliente no existe', async () => {
      repositorio.findOne.mockResolvedValue(null);

      await expect(
        service.actualizar('no-existe', { nombre: 'Otro' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('no debe modificar campos no proporcionados', async () => {
      const clienteExistente = crearClienteMock();
      repositorio.findOne.mockResolvedValue(clienteExistente);
      repositorio.save.mockResolvedValue(clienteExistente);

      await service.actualizar('12345678-9', {});

      expect(clienteExistente.nombre).toBe('Juan Perez');
      expect(clienteExistente.telefono).toBe('+56912345678');
    });
  });
});
