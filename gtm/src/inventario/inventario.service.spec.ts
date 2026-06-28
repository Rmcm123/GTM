import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service';
import { Repuesto } from './repuesto.entity';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { OBSERVADORES_INVENTARIO } from './observadores/observador-inventario.interface';
import { StockBajoObservador } from './observadores/stock-bajo.observador';

const crearRepuestoMock = (overrides: Partial<Repuesto> = {}): Repuesto => ({
  id: 'r-uuid-1',
  nombre: 'Aceite 10W-40',
  categoria: 'Lubricantes',
  stock: 6,
  minimo: 8,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  ...overrides,
});

describe('InventarioService', () => {
  let service: InventarioService;
  let repoRepuestos: Record<string, jest.Mock>;
  let repoMovimientos: Record<string, jest.Mock>;
  let stockBajoObservador: StockBajoObservador;

  beforeEach(async () => {
    repoRepuestos = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((datos: Partial<Repuesto>) => ({ ...datos }) as Repuesto),
      save: jest.fn((entidad: Partial<Repuesto>) =>
        Promise.resolve({ id: 'r-uuid-1', ...entidad } as Repuesto),
      ),
      count: jest.fn(),
    };

    repoMovimientos = {
      find: jest.fn(),
      create: jest.fn(
        (datos: Partial<MovimientoInventario>) =>
          ({ ...datos }) as MovimientoInventario,
      ),
      save: jest.fn((entidad: Partial<MovimientoInventario>) =>
        Promise.resolve({ id: 'm-uuid-1', ...entidad } as MovimientoInventario),
      ),
    };

    stockBajoObservador = new StockBajoObservador();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventarioService,
        { provide: getRepositoryToken(Repuesto), useValue: repoRepuestos },
        {
          provide: getRepositoryToken(MovimientoInventario),
          useValue: repoMovimientos,
        },
        { provide: OBSERVADORES_INVENTARIO, useValue: [stockBajoObservador] },
        { provide: StockBajoObservador, useValue: stockBajoObservador },
      ],
    }).compile();

    service = module.get<InventarioService>(InventarioService);
  });

  describe('obtenerInventario', () => {
    it('debe retornar lista de repuestos mapeados', async () => {
      repoRepuestos.find.mockResolvedValue([crearRepuestoMock()]);

      const resultado = await service.obtenerInventario();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nombre).toBe('Aceite 10W-40');
    });
  });

  describe('obtenerMovimientos', () => {
    it('debe retornar movimientos con nombres de repuestos', async () => {
      repoMovimientos.find.mockResolvedValue([
        {
          id: 'm-1',
          repuestoId: 'r-uuid-1',
          tipo: 'Entrada',
          cantidad: 5,
          stockAnterior: 0,
          stockNuevo: 5,
          nota: 'Test',
          creadoEn: new Date(),
        },
      ]);
      repoRepuestos.find.mockResolvedValue([crearRepuestoMock()]);

      const resultado = await service.obtenerMovimientos();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nombre).toBe('Aceite 10W-40');
    });

    it('debe mostrar "Repuesto eliminado" si no existe el repuesto', async () => {
      repoMovimientos.find.mockResolvedValue([
        {
          id: 'm-1',
          repuestoId: 'no-existe',
          tipo: 'Entrada',
          cantidad: 5,
          stockAnterior: 0,
          stockNuevo: 5,
          nota: null,
          creadoEn: new Date(),
        },
      ]);
      repoRepuestos.find.mockResolvedValue([]);

      const resultado = await service.obtenerMovimientos();

      expect(resultado[0].nombre).toBe('Repuesto eliminado');
    });
  });

  describe('actualizarStock', () => {
    it('debe actualizar stock exitosamente', async () => {
      const repuesto = crearRepuestoMock({ stock: 6 });
      repoRepuestos.findOne.mockResolvedValue(repuesto);
      repoRepuestos.save.mockResolvedValue({ ...repuesto, stock: 10 });

      const resultado = await service.actualizarStock({
        nombre: 'Aceite 10W-40',
        stock: 10,
      });

      expect(resultado.stock).toBe(10);
    });

    it('debe lanzar error si nombre esta vacio', async () => {
      await expect(
        service.actualizarStock({ nombre: '', stock: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar error si stock es negativo', async () => {
      await expect(
        service.actualizarStock({ nombre: 'Aceite', stock: -1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('registrarEntrada', () => {
    it('debe registrar entrada exitosamente', async () => {
      const repuesto = crearRepuestoMock({ stock: 5 });
      repoRepuestos.findOne.mockResolvedValue(repuesto);
      repoRepuestos.save.mockResolvedValue({ ...repuesto, stock: 10 });

      const resultado = await service.registrarEntrada({
        nombre: 'Aceite 10W-40',
        cantidad: 5,
      });

      expect(resultado.stock).toBe(10);
    });

    it('debe lanzar error si cantidad es 0', async () => {
      await expect(
        service.registrarEntrada({ nombre: 'Aceite', cantidad: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar error si cantidad es negativa', async () => {
      await expect(
        service.registrarEntrada({ nombre: 'Aceite', cantidad: -3 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('registrarSalida', () => {
    it('debe registrar salida exitosamente', async () => {
      const repuesto = crearRepuestoMock({ stock: 10 });
      repoRepuestos.findOne.mockResolvedValue(repuesto);
      repoRepuestos.save.mockResolvedValue({ ...repuesto, stock: 7 });

      const resultado = await service.registrarSalida({
        nombre: 'Aceite 10W-40',
        cantidad: 3,
      });

      expect(resultado.stock).toBe(7);
    });

    it('debe lanzar error si no hay stock suficiente', async () => {
      repoRepuestos.findOne.mockResolvedValue(crearRepuestoMock({ stock: 2 }));

      await expect(
        service.registrarSalida({ nombre: 'Aceite 10W-40', cantidad: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar error si el repuesto no existe', async () => {
      repoRepuestos.findOne.mockResolvedValue(null);

      await expect(
        service.registrarSalida({ nombre: 'No existe', cantidad: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('onModuleInit (sembrarInventarioInicial)', () => {
    it('debe sembrar inventario si la tabla esta vacia', async () => {
      repoRepuestos.count.mockResolvedValue(0);
      repoRepuestos.save.mockImplementation((entidad) =>
        Promise.resolve({ id: 'r-nuevo', ...entidad }),
      );

      await service.onModuleInit();

      expect(repoRepuestos.create).toHaveBeenCalledTimes(3);
    });

    it('no debe sembrar si ya hay datos', async () => {
      repoRepuestos.count.mockResolvedValue(5);

      await service.onModuleInit();

      expect(repoRepuestos.create).not.toHaveBeenCalled();
    });
  });

  describe('obtenerAlertasStockBajo', () => {
    it('debe retornar alertas sincronizadas', async () => {
      repoRepuestos.find.mockResolvedValue([
        crearRepuestoMock({ id: 'r-1', stock: 3, minimo: 8 }),
      ]);

      const alertas = await service.obtenerAlertasStockBajo();

      expect(alertas).toHaveLength(1);
    });
  });
});
