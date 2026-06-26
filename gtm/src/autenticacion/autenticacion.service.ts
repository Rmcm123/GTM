import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RespuestaAutenticacionDto } from './dto/respuesta-autenticacion.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import type { RolUsuario, Usuario } from '../usuarios/usuario.entity';

type JwtPayload = {
  sub: string;
  correo: string;
  rol: RolUsuario;
  tipo: 'access' | 'refresh';
};

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(datosLogin: LoginDto): Promise<RespuestaAutenticacionDto> {
    this.validarDatosLogin(datosLogin);

    const usuario = await this.usuariosService.buscarPorCorreo(
      datosLogin.correo,
    );

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const contrasenaValida = await this.usuariosService.validarContrasena(
      datosLogin.contrasena,
      usuario.contrasenaHash,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return this.generarRespuestaAutenticacion(usuario);
  }

  async refresh(
    datosRefresh: RefreshTokenDto,
  ): Promise<RespuestaAutenticacionDto> {
    if (!datosRefresh.refreshToken) {
      throw new BadRequestException('El refresh token es obligatorio');
    }

    const payload = await this.verificarRefreshToken(datosRefresh.refreshToken);
    const usuario = await this.usuariosService.buscarPorId(payload.sub);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Sesion no valida');
    }

    const refreshTokenValido = await this.usuariosService.validarRefreshToken(
      usuario,
      datosRefresh.refreshToken,
    );

    if (!refreshTokenValido) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    return this.generarRespuestaAutenticacion(usuario);
  }

  async logout(usuarioId: string): Promise<{ mensaje: string }> {
    await this.usuariosService.limpiarRefreshToken(usuarioId);

    return { mensaje: 'Sesion cerrada correctamente' };
  }

  async obtenerPerfil(usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no valido');
    }

    return this.usuariosService.convertirARespuesta(usuario);
  }

  private async generarRespuestaAutenticacion(
    usuario: Usuario,
  ): Promise<RespuestaAutenticacionDto> {
    const accessToken = await this.firmarToken(usuario, 'access');
    const refreshToken = await this.firmarToken(usuario, 'refresh');

    await this.usuariosService.guardarRefreshToken(usuario.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      usuario: this.usuariosService.convertirARespuesta(usuario),
    };
  }

  private async firmarToken(
    usuario: Usuario,
    tipo: 'access' | 'refresh',
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      tipo,
    };

    const secret =
      tipo === 'access'
        ? this.configService.get<string>(
            'JWT_ACCESS_SECRET',
            'gtm_access_secret_dev',
          )
        : this.configService.get<string>(
            'JWT_REFRESH_SECRET',
            'gtm_refresh_secret_dev',
          );

    const expiresIn =
      tipo === 'access'
        ? this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')
        : this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    return this.jwtService.signAsync(payload, {
      expiresIn: expiresIn as never,
      secret,
    });
  }

  private async verificarRefreshToken(
    refreshToken: string,
  ): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>(
            'JWT_REFRESH_SECRET',
            'gtm_refresh_secret_dev',
          ),
        },
      );

      if (payload.tipo !== 'refresh') {
        throw new UnauthorizedException('Refresh token invalido');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }
  }

  private validarDatosLogin(datosLogin: LoginDto) {
    if (
      !datosLogin.correo ||
      !datosLogin.contrasena ||
      datosLogin.correo.trim().length === 0 ||
      datosLogin.contrasena.trim().length === 0
    ) {
      throw new BadRequestException('Correo y contrasena son obligatorios');
    }
  }
}
