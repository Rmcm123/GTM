import { Test, TestingModule } from '@nestjs/testing';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';

describe('ClientesController', () => {
  let controller: ClientesController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      buscarTodos: jest.fn().mockResolvedValue([]),
      crear: jest.fn().mockResolvedValue({ id: '1', rut: '12345678-9' }),
      actualizar: jest
        .fn()
        .mockResolvedValue({ id: '1', nombre: 'Actualizado' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [{ provide: ClientesService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClientesController>(ClientesController);
  });

  it('buscarTodos debe delegar al service', async () => {
    await controller.buscarTodos();
    expect(service.buscarTodos).toHaveBeenCalled();
  });

  it('crear debe delegar al service con los datos del body', async () => {
    const datos = {
      rut: '12345678-9',
      nombre: 'Juan',
      telefono: '123',
      correo: 'j@t.com',
    };
    await controller.crear(datos);
    expect(service.crear).toHaveBeenCalledWith(datos);
  });

  it('actualizar debe delegar al service con rut y datos', async () => {
    const datos = { nombre: 'Pedro' };
    await controller.actualizar('12345678-9', datos);
    expect(service.actualizar).toHaveBeenCalledWith('12345678-9', datos);
  });
});
