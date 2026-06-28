import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditoriaService } from './auditoria.service';

const METODOS_AUDITADOS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const DESCRIPCIONES: Record<string, Record<string, string>> = {
  POST: {
    '/clientes': 'Crear cliente',
    '/vehiculos': 'Registrar vehiculo',
    '/ordenes-trabajo': 'Crear orden de trabajo',
    '/inventario/actualizar-stock': 'Actualizar stock',
    '/inventario/entrada': 'Registrar entrada de inventario',
    '/inventario/salida': 'Registrar salida de inventario',
  },
  PATCH: {
    '/clientes': 'Actualizar cliente',
    '/ordenes-trabajo': 'Actualizar estado de orden',
  },
  DELETE: {},
};

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const metodo: string = request.method;

    if (!METODOS_AUDITADOS.has(metodo)) {
      return next.handle();
    }

    const recurso: string = request.url;
    const datosEntrada = request.body as Record<string, unknown> | undefined;
    const direccionIp: string =
      request.ip ?? request.socket?.remoteAddress ?? '';
    const usuario: string =
      (request as Request & { user?: { email?: string } }).user?.email ??
      'sistema';

    return next.handle().pipe(
      tap(() => {
        const rutaBase = this.extraerRutaBase(recurso);
        const descripcion =
          DESCRIPCIONES[metodo]?.[rutaBase] ?? `${metodo} ${recurso}`;

        void this.auditoriaService.registrar({
          accion: metodo,
          recurso,
          descripcion,
          datosEntrada,
          usuario,
          direccionIp,
        });
      }),
    );
  }

  private extraerRutaBase(url: string): string {
    // Remover query params y parametros de ruta numericos/uuid
    const sinQuery = url.split('?')[0];
    const partes = sinQuery.split('/').filter(Boolean);

    // Reconstruir la ruta sin IDs (UUID o numeros)
    const partesLimpias = partes.filter(
      (parte) => !/^[0-9a-f-]{36}$/i.test(parte) && !/^\d+$/.test(parte),
    );

    return '/' + partesLimpias.join('/');
  }
}
