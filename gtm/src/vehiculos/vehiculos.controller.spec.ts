import { Test, TestingModule } from '@nestjs/testing';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';

describe('VehiculosController', () => {
  let controller: VehiculosController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      buscarTodos: jest.fn().mockResolvedValue([]),
      buscarPorCliente: jest.fn().mockResolvedValue([]),
      buscarPorRutCliente: jest.fn().mockResolvedValue([]),
      buscarPorPatente: jest.fn().mockResolvedValue(null),
      crear: jest.fn().mockResolvedValue({ id: '1', patente: 'ABCD12' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculosController],
      providers: [{ provide: VehiculosService, useValue: service }],
    }).compile();

    controller = module.get<VehiculosController>(VehiculosController);
  });

  it('buscarTodos debe delegar al service', async () => {
    await controller.buscarTodos();
    expect(service.buscarTodos).toHaveBeenCalled();
  });

  it('buscarPorCliente debe delegar con clienteId', async () => {
    await controller.buscarPorCliente('c-uuid-1');
    expect(service.buscarPorCliente).toHaveBeenCalledWith('c-uuid-1');
  });

  it('buscarPorRutCliente debe delegar con rut', async () => {
    await controller.buscarPorRutCliente('12345678-9');
    expect(service.buscarPorRutCliente).toHaveBeenCalledWith('12345678-9');
  });

  it('buscarPorPatente debe delegar con patente', async () => {
    await controller.buscarPorPatente('ABCD12');
    expect(service.buscarPorPatente).toHaveBeenCalledWith('ABCD12');
  });

  it('crear debe delegar con los datos del body', async () => {
    const datos = {
      rutCliente: '12345678-9',
      patente: 'ABCD12',
      marca: 'Toyota',
      modelo: 'Corolla',
      año: 2020,
    };
    await controller.crear(datos);
    expect(service.crear).toHaveBeenCalledWith(datos);
  });
});
