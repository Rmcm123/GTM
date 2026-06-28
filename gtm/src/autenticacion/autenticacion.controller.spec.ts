import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestConUsuario } from './guards/jwt-auth.guard';

describe('AutenticacionController', () => {
  let controller: AutenticacionController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      login: jest.fn().mockResolvedValue({ accessToken: 'token' }),
      refresh: jest.fn().mockResolvedValue({ accessToken: 'token' }),
      obtenerPerfil: jest.fn().mockResolvedValue({ id: 'uuid-1' }),
      logout: jest.fn().mockResolvedValue({ mensaje: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutenticacionController],
      providers: [{ provide: AutenticacionService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AutenticacionController>(AutenticacionController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('login debe delegar al service', async () => {
    const datos = { correo: 'a@a.com', contrasena: '123' };
    await controller.login(datos);
    expect(service.login).toHaveBeenCalledWith(datos);
  });

  it('refresh debe delegar al service', async () => {
    const datos = { refreshToken: '123' };
    await controller.refresh(datos);
    expect(service.refresh).toHaveBeenCalledWith(datos);
  });

  it('obtenerPerfil debe delegar al service con id de usuario', async () => {
    const req = {
      usuario: { id: 'uuid-1', rut: '111', rol: 'ADMIN' },
    } as unknown as RequestConUsuario;
    await controller.obtenerPerfil(req);
    expect(service.obtenerPerfil).toHaveBeenCalledWith('uuid-1');
  });

  it('logout debe delegar al service con id de usuario', async () => {
    const req = {
      usuario: { id: 'uuid-1', rut: '111', rol: 'ADMIN' },
    } as unknown as RequestConUsuario;
    await controller.logout(req);
    expect(service.logout).toHaveBeenCalledWith('uuid-1');
  });
});
