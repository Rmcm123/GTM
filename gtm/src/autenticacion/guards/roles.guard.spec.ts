import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../usuarios/usuario.entity';
import { RolesGuard } from './roles.guard';

function crearContextoConRol(rol?: RolUsuario) {
  return {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        usuario: rol
          ? {
              correo: 'usuario@gtm.cl',
              id: 'usuario-1',
              rol,
            }
          : undefined,
      }),
    }),
  } as never;
}

describe('RolesGuard', () => {
  it('permite acceso cuando no hay roles definidos', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    };
    const guard = new RolesGuard(reflector as unknown as Reflector);

    expect(guard.canActivate(crearContextoConRol())).toBe(true);
  });

  it('permite acceso cuando el usuario tiene un rol permitido', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([RolUsuario.Administrador]),
    };
    const guard = new RolesGuard(reflector as unknown as Reflector);

    expect(
      guard.canActivate(crearContextoConRol(RolUsuario.Administrador)),
    ).toBe(true);
  });

  it('rechaza acceso cuando el rol no esta permitido', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([RolUsuario.Administrador]),
    };
    const guard = new RolesGuard(reflector as unknown as Reflector);

    expect(() =>
      guard.canActivate(crearContextoConRol(RolUsuario.Recepcionista)),
    ).toThrow(ForbiddenException);
  });
});
