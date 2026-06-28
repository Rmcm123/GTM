import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { InventarioService } from '../inventario/inventario.service';

describe('AlertasService', () => {
  let service: AlertasService;
  let inventarioService: Record<string, jest.Mock>;

  beforeEach(async () => {
    inventarioService = {
      obtenerAlertasStockBajo: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasService,
        { provide: InventarioService, useValue: inventarioService },
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
  });

  describe('obtenerTodas', () => {
    it('debe retornar lista vacia si no hay alertas', async () => {
      const resultado = await service.obtenerTodas();
      expect(resultado).toHaveLength(0);
    });

    it('debe incluir alertas de stock bajo', async () => {
      inventarioService.obtenerAlertasStockBajo.mockResolvedValue([
        {
          repuestoId: 'r-1',
          nombre: 'Aceite',
          stock: 2,
          minimo: 8,
          mensaje: 'Aceite tiene stock bajo (2/8)',
          creadoEn: new Date().toISOString(),
        },
      ]);

      const resultado = await service.obtenerTodas();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipo).toBe('stock_bajo');
      expect(resultado[0].datos.nombre).toBe('Aceite');
    });

    it('debe clasificar prioridad alta si stock es 0', async () => {
      inventarioService.obtenerAlertasStockBajo.mockResolvedValue([
        {
          repuestoId: 'r-1',
          nombre: 'Aceite',
          stock: 0,
          minimo: 8,
          mensaje: 'Sin stock',
          creadoEn: new Date().toISOString(),
        },
      ]);

      const resultado = await service.obtenerTodas();

      expect(resultado[0].prioridad).toBe('alta');
    });

    it('debe clasificar prioridad media si stock <= minimo/2', async () => {
      inventarioService.obtenerAlertasStockBajo.mockResolvedValue([
        {
          repuestoId: 'r-1',
          nombre: 'Aceite',
          stock: 3,
          minimo: 8,
          mensaje: 'Stock bajo',
          creadoEn: new Date().toISOString(),
        },
      ]);

      const resultado = await service.obtenerTodas();

      expect(resultado[0].prioridad).toBe('media');
    });

    it('debe clasificar prioridad baja si stock > minimo/2', async () => {
      inventarioService.obtenerAlertasStockBajo.mockResolvedValue([
        {
          repuestoId: 'r-1',
          nombre: 'Aceite',
          stock: 6,
          minimo: 8,
          mensaje: 'Stock bajo',
          creadoEn: new Date().toISOString(),
        },
      ]);

      const resultado = await service.obtenerTodas();

      expect(resultado[0].prioridad).toBe('baja');
    });

    it('debe ordenar alertas por prioridad (alta primero)', async () => {
      inventarioService.obtenerAlertasStockBajo.mockResolvedValue([
        {
          repuestoId: 'r-1',
          nombre: 'Filtro',
          stock: 6,
          minimo: 8,
          mensaje: 'Stock bajo',
          creadoEn: new Date().toISOString(),
        },
        {
          repuestoId: 'r-2',
          nombre: 'Aceite',
          stock: 0,
          minimo: 10,
          mensaje: 'Sin stock',
          creadoEn: new Date().toISOString(),
        },
      ]);

      const resultado = await service.obtenerTodas();

      expect(resultado[0].prioridad).toBe('alta');
      expect(resultado[1].prioridad).toBe('baja');
    });
  });
});
