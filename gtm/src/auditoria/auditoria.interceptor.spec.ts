import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { AuditoriaInterceptor } from './auditoria.interceptor';
import { AuditoriaService } from './auditoria.service';

type MockRequest = {
  method: string;
  url: string;
  body: Record<string, unknown>;
  ip: string;
  socket: { remoteAddress: string };
  user?: { email?: string };
};

const crearContextMock = (
  method: string,
  url: string,
  body: Record<string, unknown> = {},
): ExecutionContext => {
  const request: MockRequest = {
    method,
    url,
    body,
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    user: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: <T>(): T => request as T,
    }),
  } as unknown as ExecutionContext;
};

const crearNextMock = (): CallHandler => ({
  handle: () => of({ resultado: 'ok' }),
});

describe('AuditoriaInterceptor', () => {
  let interceptor: AuditoriaInterceptor;
  let service: { registrar: jest.Mock };

  beforeEach(() => {
    service = {
      registrar: jest.fn().mockResolvedValue({}),
    };
    interceptor = new AuditoriaInterceptor(
      service as unknown as AuditoriaService,
    );
  });

  it('debe registrar accion en POST', (done) => {
    const context = crearContextMock('POST', '/clientes', {
      rut: '12345678-9',
    });
    const next = crearNextMock();

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(service.registrar).toHaveBeenCalledWith(
          expect.objectContaining({
            accion: 'POST',
            recurso: '/clientes',
          }),
        );
        done();
      },
    });
  });

  it('debe registrar accion en PATCH', (done) => {
    const context = crearContextMock('PATCH', '/ordenes-trabajo/1/estado');
    const next = crearNextMock();

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(service.registrar).toHaveBeenCalledWith(
          expect.objectContaining({
            accion: 'PATCH',
          }),
        );
        done();
      },
    });
  });

  it('debe registrar accion en DELETE', (done) => {
    const context = crearContextMock('DELETE', '/clientes/uuid-1');
    const next = crearNextMock();

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(service.registrar).toHaveBeenCalledWith(
          expect.objectContaining({
            accion: 'DELETE',
          }),
        );
        done();
      },
    });
  });

  it('no debe registrar en GET', (done) => {
    const context = crearContextMock('GET', '/clientes');
    const next = crearNextMock();

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(service.registrar).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('debe usar "sistema" si no hay usuario autenticado', (done) => {
    const context = crearContextMock('POST', '/clientes');
    const next = crearNextMock();

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(service.registrar).toHaveBeenCalledWith(
          expect.objectContaining({
            usuario: 'sistema',
          }),
        );
        done();
      },
    });
  });

  it('debe generar descripcion legible para rutas conocidas', (done) => {
    const context = crearContextMock('POST', '/clientes');
    const next = crearNextMock();

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(service.registrar).toHaveBeenCalledWith(
          expect.objectContaining({
            descripcion: 'Crear cliente',
          }),
        );
        done();
      },
    });
  });
});
