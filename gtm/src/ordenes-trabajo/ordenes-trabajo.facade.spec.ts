import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesTrabajoFacade } from './ordenes-trabajo.facade';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { EstadoOrdenTrabajo } from './orden-trabajo.entity';

describe('OrdenesTrabajoFacade', () => {
  let facade: OrdenesTrabajoFacade;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      buscarTodas: jest.fn().mockResolvedValue([]),
      buscarPorId: jest.fn().mockResolvedValue({ id: 1 }),
      crear: jest.fn().mockResolvedValue({ id: 1 }),
      actualizarEstado: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesTrabajoFacade,
        { provide: OrdenesTrabajoService, useValue: service },
      ],
    }).compile();

    facade = module.get<OrdenesTrabajoFacade>(OrdenesTrabajoFacade);
  });

  it('obtenerOrdenes debe delegar a buscarTodas', async () => {
    await facade.obtenerOrdenes();
    expect(service.buscarTodas).toHaveBeenCalled();
  });

  it('obtenerOrden debe delegar a buscarPorId', async () => {
    await facade.obtenerOrden(1);
    expect(service.buscarPorId).toHaveBeenCalledWith(1);
  });

  it('crearOrden debe delegar a crear', async () => {
    const datos = {
      patenteVehiculo: 'ABCD12',
      tipoServicio: 'Mantencion',
      diagnosticoInicial: 'Test',
      fechaIngreso: '2026-06-28',
    };
    await facade.crearOrden(datos);
    expect(service.crear).toHaveBeenCalledWith(datos);
  });

  it('actualizarEstado debe delegar a actualizarEstado del service', async () => {
    await facade.actualizarEstado(1, EstadoOrdenTrabajo.EnProceso);
    expect(service.actualizarEstado).toHaveBeenCalledWith(1, {
      estado: EstadoOrdenTrabajo.EnProceso,
    });
  });
});
