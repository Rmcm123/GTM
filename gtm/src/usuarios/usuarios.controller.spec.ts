import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      buscarTodos: jest.fn().mockResolvedValue([]),
      buscarMecanicosActivos: jest.fn().mockResolvedValue([]),
      crear: jest.fn().mockResolvedValue({ id: 'uuid-1', rut: '111-1' }),
      actualizarEstado: jest.fn().mockResolvedValue({ id: 'uuid-1', activo: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [{ provide: UsuariosService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('buscarTodos debe delegar al service', async () => {
    await controller.buscarTodos();
    expect(service.buscarTodos).toHaveBeenCalled();
  });

  it('buscarMecanicos debe delegar al service', async () => {
    await controller.buscarMecanicos();
    expect(service.buscarMecanicosActivos).toHaveBeenCalled();
  });

  it('crear debe delegar con el body', async () => {
    const datos = {
      rut: '111-1',
      nombre: 'Juan',
      correo: 'juan@test.com',
      contrasena: '1234',
      rol: 'MECANICO' as any,
    };
    await controller.crear(datos);
    expect(service.crear).toHaveBeenCalledWith(datos);
  });

  it('actualizarEstado debe delegar con id y activo', async () => {
    const datos = { activo: false };
    await controller.actualizarEstado('uuid-1', datos);
    expect(service.actualizarEstado).toHaveBeenCalledWith('uuid-1', false);
  });
});
