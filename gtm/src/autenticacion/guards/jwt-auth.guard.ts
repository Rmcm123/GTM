import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { RolUsuario } from '../../usuarios/usuario.entity';

export type UsuarioAutenticado = {
  id: string;
  correo: string;
  rol: RolUsuario;
};

export type RequestConUsuario = Request & {
  usuario?: UsuarioAutenticado;
};

type JwtPayload = {
  sub: string;
  correo: string;
  rol: RolUsuario;
  tipo: 'access' | 'refresh';
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de acceso no enviado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>(
          'JWT_ACCESS_SECRET',
          'gtm_access_secret_dev',
        ),
      });

      if (payload.tipo !== 'access') {
        throw new UnauthorizedException('Token de acceso invalido');
      }

      request.usuario = {
        id: payload.sub,
        correo: payload.correo,
        rol: payload.rol,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token de acceso invalido o expirado');
    }
  }

  private extraerToken(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [tipo, token] = authorization.split(' ');

    if (tipo !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
