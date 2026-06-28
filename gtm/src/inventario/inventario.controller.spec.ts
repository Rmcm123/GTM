import { Test, TestingModule } from '@nestjs/testing';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';

describe('InventarioController', () => {
  let controller: InventarioController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      obtenerInventario: jest.fn().mockResolvedValue([]),
      obtenerMovimientos: jest.fn().mockResolvedValue([]),
      obtenerAlertasStockBajo: jest.fn().mockResolvedValue([]),
      actualizarStock: jest.fn().mockResolvedValue({ id: '1' }),
      registrarEntrada: jest.fn().mockResolvedValue({ id: '1' }),
      registrarSalida: jest.fn().mockResolvedValue({ id: '1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventarioController],
      providers: [{ provide: InventarioService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InventarioController>(InventarioController);
  });

  it('obtenerInventario debe delegar al service', async () => {
    await controller.obtenerInventario();
    expect(service.obtenerInventario).toHaveBeenCalled();
  });

  it('obtenerMovimientos debe delegar al service', async () => {
    await controller.obtenerMovimientos();
    expect(service.obtenerMovimientos).toHaveBeenCalled();
  });

  it('obtenerAlertasStockBajo debe delegar al service', async () => {
    await controller.obtenerAlertasStockBajo();
    expect(service.obtenerAlertasStockBajo).toHaveBeenCalled();
  });

  it('actualizarStock debe delegar con datos', async () => {
    const datos = { nombre: 'Aceite', stock: 10 };
    await controller.actualizarStock(datos);
    expect(service.actualizarStock).toHaveBeenCalledWith(datos);
  });

  it('registrarEntrada debe delegar con datos', async () => {
    const datos = { nombre: 'Aceite', cantidad: 5 };
    await controller.registrarEntrada(datos);
    expect(service.registrarEntrada).toHaveBeenCalledWith(datos);
  });

  it('registrarSalida debe delegar con datos', async () => {
    const datos = { nombre: 'Aceite', cantidad: 3 };
    await controller.registrarSalida(datos);
    expect(service.registrarSalida).toHaveBeenCalledWith(datos);
  });
});
