import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RolUsuario, type Usuario } from '../usuarios/usuario.entity';
import { AutenticacionService } from './autenticacion.service';

function crearUsuario(parcial: Partial<Usuario> = {}): Usuario {
  return {
    activo: true,
    contrasenaHash: 'hash',
    correo: 'admin@gtm.cl',
    id: 'usuario-1',
    nombre: 'Administrador',
    rol: RolUsuario.Administrador,
    ...parcial,
  } as Usuario;
}

function crearDependencias(usuario: Usuario | null = crearUsuario()) {
  const usuariosService = {
    buscarPorCorreo: jest.fn().mockResolvedValue(usuario),
    buscarPorId: jest.fn().mockResolvedValue(usuario),
    convertirARespuesta: jest.fn((usuarioRespuesta: Usuario) => ({
      activo: usuarioRespuesta.activo,
      correo: usuarioRespuesta.correo,
      id: usuarioRespuesta.id,
      nombre: usuarioRespuesta.nombre,
      rol: usuarioRespuesta.rol,
    })),
    guardarRefreshToken: jest.fn().mockResolvedValue(undefined),
    limpiarRefreshToken: jest.fn().mockResolvedValue(undefined),
    validarContrasena: jest.fn().mockResolvedValue(true),
    validarRefreshToken: jest.fn().mockResolvedValue(true),
  };
  const jwtService = {
    signAsync: jest
      .fn()
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token'),
    verifyAsync: jest.fn().mockResolvedValue({
      correo: 'admin@gtm.cl',
      rol: RolUsuario.Administrador,
      sub: 'usuario-1',
      tipo: 'refresh',
    }),
  };
  const configService = {
    get: jest.fn((_clave: string, valorPorDefecto: string) => valorPorDefecto),
  };
  const service = new AutenticacionService(
    usuariosService as never,
    jwtService,
    configService as never,
  );

  return { configService, jwtService, service, usuariosService };
}

describe('AutenticacionService', () => {
  it('rechaza login con datos incompletos', async () => {
    const { service } = crearDependencias();

    await expect(service.login({ contrasena: '', correo: '' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza credenciales invalidas', async () => {
    const { service, usuariosService } = crearDependencias();
    usuariosService.validarContrasena.mockResolvedValue(false);

    await expect(
      service.login({
        contrasena: 'incorrecta',
        correo: 'admin@gtm.cl',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('genera access token y refresh token cuando el login es correcto', async () => {
    const { service, usuariosService } = crearDependencias();

    const respuesta = await service.login({
      contrasena: 'Admin1234',
      correo: 'admin@gtm.cl',
    });

    expect(respuesta.accessToken).toBe('access-token');
    expect(respuesta.refreshToken).toBe('refresh-token');
    expect(respuesta.usuario.rol).toBe(RolUsuario.Administrador);
    expect(usuariosService.guardarRefreshToken).toHaveBeenCalledWith(
      'usuario-1',
      'refresh-token',
    );
  });

  it('rechaza refresh token vacio', async () => {
    const { service } = crearDependencias();

    await expect(service.refresh({ refreshToken: '' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza refresh token cuando no coincide con el guardado', async () => {
    const { service, usuariosService } = crearDependencias();
    usuariosService.validarRefreshToken.mockResolvedValue(false);

    await expect(
      service.refresh({ refreshToken: 'refresh-token-antiguo' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
