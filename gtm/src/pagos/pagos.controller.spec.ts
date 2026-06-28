import { Test, TestingModule } from '@nestjs/testing';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { MedioPago, TipoPago } from './pago.entity';

describe('PagosController', () => {
  let controller: PagosController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      buscarPorOrden: jest.fn().mockResolvedValue([]),
      registrar: jest.fn().mockResolvedValue({ id: 'pago-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosController],
      providers: [{ provide: PagosService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PagosController>(PagosController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('buscarPorOrden debe delegar al service', async () => {
    await controller.buscarPorOrden(1);
    expect(service.buscarPorOrden).toHaveBeenCalledWith(1);
  });

  it('registrar debe delegar al service', async () => {
    const datos = {
      ordenTrabajoId: 1,
      monto: 1000,
      medioPago: MedioPago.Efectivo,
      tipoPago: TipoPago.Adelanto,
    };
    await controller.registrar(datos);
    expect(service.registrar).toHaveBeenCalledWith(datos);
  });
});
