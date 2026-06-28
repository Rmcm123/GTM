import { StockBajoObservador } from './stock-bajo.observador';
import type { Repuesto } from '../repuesto.entity';

const crearRepuestoMock = (overrides: Partial<Repuesto> = {}): Repuesto => ({
  id: 'r-uuid-1',
  nombre: 'Aceite 10W-40',
  categoria: 'Lubricantes',
  stock: 3,
  minimo: 8,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  ...overrides,
});

describe('StockBajoObservador', () => {
  let observador: StockBajoObservador;

  beforeEach(() => {
    observador = new StockBajoObservador();
  });

  describe('actualizar', () => {
    it('debe crear alerta si stock < minimo', () => {
      const repuesto = crearRepuestoMock({ stock: 3, minimo: 8 });

      observador.actualizar({
        repuesto,
        stockAnterior: 5,
        tipoMovimiento: 'Salida',
      });

      const alertas = observador.obtenerAlertas();
      expect(alertas).toHaveLength(1);
      expect(alertas[0].nombre).toBe('Aceite 10W-40');
      expect(alertas[0].stock).toBe(3);
    });

    it('debe eliminar alerta si stock >= minimo', () => {
      const repuestoBajo = crearRepuestoMock({ stock: 3, minimo: 8 });
      observador.actualizar({
        repuesto: repuestoBajo,
        stockAnterior: 5,
        tipoMovimiento: 'Salida',
      });

      const repuestoOk = crearRepuestoMock({ stock: 10, minimo: 8 });
      observador.actualizar({
        repuesto: repuestoOk,
        stockAnterior: 3,
        tipoMovimiento: 'Entrada',
      });

      expect(observador.obtenerAlertas()).toHaveLength(0);
    });

    it('debe eliminar alerta si minimo <= 0', () => {
      const repuesto = crearRepuestoMock({ stock: 3, minimo: 0 });

      observador.actualizar({
        repuesto,
        stockAnterior: 5,
        tipoMovimiento: 'Actualizacion',
      });

      expect(observador.obtenerAlertas()).toHaveLength(0);
    });
  });

  describe('sincronizarConInventario', () => {
    it('debe recalcular todas las alertas', () => {
      const repuestos = [
        crearRepuestoMock({ id: 'r-1', nombre: 'Aceite', stock: 3, minimo: 8 }),
        crearRepuestoMock({
          id: 'r-2',
          nombre: 'Filtro',
          stock: 10,
          minimo: 6,
        }),
        crearRepuestoMock({ id: 'r-3', nombre: 'Bujias', stock: 2, minimo: 5 }),
      ];

      observador.sincronizarConInventario(repuestos);

      const alertas = observador.obtenerAlertas();
      expect(alertas).toHaveLength(2);
    });
  });

  describe('obtenerAlertas', () => {
    it('debe ordenar por stock ascendente', () => {
      const repuestos = [
        crearRepuestoMock({ id: 'r-1', nombre: 'Aceite', stock: 5, minimo: 8 }),
        crearRepuestoMock({ id: 'r-2', nombre: 'Filtro', stock: 1, minimo: 6 }),
        crearRepuestoMock({ id: 'r-3', nombre: 'Bujias', stock: 3, minimo: 5 }),
      ];

      observador.sincronizarConInventario(repuestos);

      const alertas = observador.obtenerAlertas();
      expect(alertas[0].stock).toBe(1);
      expect(alertas[1].stock).toBe(3);
      expect(alertas[2].stock).toBe(5);
    });
  });
});
