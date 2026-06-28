import { UnauthorizedException } from '@nestjs/common';
import { RolUsuario } from '../../usuarios/usuario.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

function crearContexto(authorization?: string) {
  const request = {
    headers: {
      authorization,
    },
  };

  return {
    request,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  };
}

describe('JwtAuthGuard', () => {
  function crearGuard(
    payload = { tipo: 'access' },
    usuario = {
      activo: true,
      correo: 'admin@gtm.cl',
      id: 'usuario-1',
      rol: RolUsuario.Administrador,
    },
  ) {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        correo: 'admin@gtm.cl',
        rol: RolUsuario.Administrador,
        sub: 'usuario-1',
        ...payload,
      }),
    };
    const configService = {
      get: jest.fn(
        (_clave: string, valorPorDefecto: string) => valorPorDefecto,
      ),
    };
    const usuariosService = {
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    };
    const guard = new JwtAuthGuard(
      jwtService,
      configService as never,
      usuariosService as never,
    );

    return { guard, jwtService, usuariosService };
  }

  it('rechaza peticiones sin token', async () => {
    const { guard } = crearGuard();
    const contexto = crearContexto();

    await expect(guard.canActivate(contexto as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza refresh token usado como access token', async () => {
    const { guard } = crearGuard({ tipo: 'refresh' });
    const contexto = crearContexto('Bearer token-refresh');

    await expect(guard.canActivate(contexto as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('agrega usuario autenticado al request cuando el token es valido', async () => {
    const { guard } = crearGuard();
    const contexto = crearContexto('Bearer token-access');

    await expect(guard.canActivate(contexto as never)).resolves.toBe(true);
    expect(contexto.request).toMatchObject({
      usuario: {
        correo: 'admin@gtm.cl',
        id: 'usuario-1',
        rol: RolUsuario.Administrador,
      },
    });
  });

  it('rechaza el token si el usuario fue desactivado', async () => {
    const { guard } = crearGuard(
      { tipo: 'access' },
      {
        activo: false,
        correo: 'admin@gtm.cl',
        id: 'usuario-1',
        rol: RolUsuario.Administrador,
      },
    );
    const contexto = crearContexto('Bearer token-access');

    await expect(guard.canActivate(contexto as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
