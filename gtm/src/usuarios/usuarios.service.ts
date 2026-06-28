import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { RolUsuario, Usuario } from './usuario.entity';
import type { CrearUsuarioDto } from './dto/crear-usuario.dto';
import type { UsuarioRespuestaDto } from './dto/usuario-respuesta.dto';

const USUARIOS_INICIALES = [
  {
    nombre: 'Administrador GTM',
    correo: 'admin@gtm.cl',
    contrasena: 'Admin1234',
    rol: RolUsuario.Administrador,
  },
  {
    nombre: 'Recepcionista GTM',
    correo: 'recepcion@gtm.cl',
    contrasena: 'Recepcion1234',
    rol: RolUsuario.Recepcionista,
  },
  {
    nombre: 'Mecanico GTM',
    correo: 'mecanico@gtm.cl',
    contrasena: 'Mecanico1234',
    rol: RolUsuario.Mecanico,
  },
  {
    nombre: 'Inventario GTM',
    correo: 'inventario@gtm.cl',
    contrasena: 'Inventario1234',
    rol: RolUsuario.Inventario,
  },
];

@Injectable()
export class UsuariosService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorioUsuarios: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    await this.sembrarUsuariosIniciales();
  }

  async buscarTodos(): Promise<UsuarioRespuestaDto[]> {
    const usuarios = await this.repositorioUsuarios.find({
      order: { creadoEn: 'DESC' },
    });

    return usuarios.map((usuario) => this.convertirARespuesta(usuario));
  }

  async buscarMecanicosActivos(): Promise<UsuarioRespuestaDto[]> {
    const usuarios = await this.repositorioUsuarios.find({
      order: { nombre: 'ASC' },
      where: {
        activo: true,
        rol: RolUsuario.Mecanico,
      },
    });

    return usuarios.map((usuario) => this.convertirARespuesta(usuario));
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repositorioUsuarios.findOne({ where: { id } });
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.repositorioUsuarios.findOne({
      where: { correo: this.normalizarCorreo(correo) },
    });
  }

  async crear(datosUsuario: CrearUsuarioDto): Promise<UsuarioRespuestaDto> {
    this.validarDatosUsuario(datosUsuario);

    const correoNormalizado = this.normalizarCorreo(datosUsuario.correo);
    const usuarioExistente = await this.buscarPorCorreo(correoNormalizado);

    if (usuarioExistente) {
      throw new BadRequestException('Ya existe un usuario con ese correo');
    }

    const usuario = this.repositorioUsuarios.create({
      nombre: datosUsuario.nombre.trim(),
      correo: correoNormalizado,
      contrasenaHash: await hash(datosUsuario.contrasena, 10),
      rol: datosUsuario.rol,
      activo: true,
    });

    const usuarioGuardado = await this.repositorioUsuarios.save(usuario);

    return this.convertirARespuesta(usuarioGuardado);
  }

  async actualizarEstado(
    usuarioId: string,
    activo: boolean,
  ): Promise<UsuarioRespuestaDto> {
    if (typeof activo !== 'boolean') {
      throw new BadRequestException(
        'El estado activo debe ser verdadero o falso',
      );
    }

    const usuario = await this.buscarPorId(usuarioId);

    if (!usuario) {
      throw new NotFoundException('No existe un usuario con ese id');
    }

    usuario.activo = activo;

    if (!activo) {
      usuario.refreshTokenHash = null;
    }

    const usuarioGuardado = await this.repositorioUsuarios.save(usuario);

    return this.convertirARespuesta(usuarioGuardado);
  }

  async validarContrasena(
    contrasena: string,
    contrasenaHash: string,
  ): Promise<boolean> {
    return compare(contrasena, contrasenaHash);
  }

  async validarRefreshToken(
    usuario: Usuario,
    refreshToken: string,
  ): Promise<boolean> {
    if (!usuario.refreshTokenHash) {
      return false;
    }

    return compare(refreshToken, usuario.refreshTokenHash);
  }

  async guardarRefreshToken(
    usuarioId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await hash(refreshToken, 10);

    await this.repositorioUsuarios.update(usuarioId, {
      refreshTokenHash,
    });
  }

  async limpiarRefreshToken(usuarioId: string): Promise<void> {
    await this.repositorioUsuarios.update(usuarioId, {
      refreshTokenHash: null,
    });
  }

  convertirARespuesta(usuario: Usuario): UsuarioRespuestaDto {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      activo: usuario.activo,
    };
  }

  private async sembrarUsuariosIniciales() {
    const totalUsuarios = await this.repositorioUsuarios.count();

    if (totalUsuarios > 0) {
      return;
    }

    for (const usuarioInicial of USUARIOS_INICIALES) {
      const usuario = this.repositorioUsuarios.create({
        nombre: usuarioInicial.nombre,
        correo: this.normalizarCorreo(usuarioInicial.correo),
        contrasenaHash: await hash(usuarioInicial.contrasena, 10),
        rol: usuarioInicial.rol,
        activo: true,
      });

      await this.repositorioUsuarios.save(usuario);
    }
  }

  private normalizarCorreo(correo: string): string {
    return correo.trim().toLowerCase();
  }

  private validarDatosUsuario(datosUsuario: CrearUsuarioDto) {
    if (
      !datosUsuario?.nombre ||
      !datosUsuario.correo ||
      !datosUsuario.contrasena ||
      !datosUsuario.rol
    ) {
      throw new BadRequestException(
        'Nombre, correo, contrasena y rol son obligatorios',
      );
    }

    if (!datosUsuario.correo.includes('@')) {
      throw new BadRequestException('El correo del usuario debe ser valido');
    }

    if (datosUsuario.contrasena.length < 8) {
      throw new BadRequestException(
        'La contrasena debe tener al menos 8 caracteres',
      );
    }

    if (!Object.values(RolUsuario).includes(datosUsuario.rol)) {
      throw new BadRequestException('El rol indicado no es valido');
    }
  }
}
