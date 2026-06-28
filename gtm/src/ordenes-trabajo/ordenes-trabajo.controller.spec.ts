import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesTrabajoController } from './ordenes-trabajo.controller';
import { OrdenesTrabajoFacade } from './ordenes-trabajo.facade';
import { EstadoOrdenTrabajo } from './orden-trabajo.entity';

describe('OrdenesTrabajoController', () => {
  let controller: OrdenesTrabajoController;
  let facade: Record<string, jest.Mock>;

  beforeEach(async () => {
    facade = {
      obtenerOrdenes: jest.fn().mockResolvedValue([]),
      obtenerOrden: jest.fn().mockResolvedValue({ id: 1 }),
      crearOrden: jest.fn().mockResolvedValue({ id: 1 }),
      actualizarEstado: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdenesTrabajoController],
      providers: [{ provide: OrdenesTrabajoFacade, useValue: facade }],
    }).compile();

    controller = module.get<OrdenesTrabajoController>(OrdenesTrabajoController);
  });

  it('buscarTodas debe delegar al facade', async () => {
    await controller.buscarTodas();
    expect(facade.obtenerOrdenes).toHaveBeenCalled();
  });

  it('buscarPorId debe delegar al facade con id', async () => {
    await controller.buscarPorId(1);
    expect(facade.obtenerOrden).toHaveBeenCalledWith(1);
  });

  it('crear debe delegar al facade con datos', async () => {
    const datos = {
      patenteVehiculo: 'ABCD12',
      tipoServicio: 'Mantencion',
      diagnosticoInicial: 'Test',
      fechaIngreso: '2026-06-28',
    };
    await controller.crear(datos);
    expect(facade.crearOrden).toHaveBeenCalledWith(datos);
  });

  it('actualizarEstado debe delegar al facade con id y estado', async () => {
    await controller.actualizarEstado(1, {
      estado: EstadoOrdenTrabajo.EnProceso,
    });
    expect(facade.actualizarEstado).toHaveBeenCalledWith(
      1,
      EstadoOrdenTrabajo.EnProceso,
    );
  });
});
