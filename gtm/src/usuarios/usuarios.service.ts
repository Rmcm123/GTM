import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { RolUsuario, Usuario } from './usuario.entity';
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

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repositorioUsuarios.findOne({ where: { id } });
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.repositorioUsuarios.findOne({
      where: { correo: this.normalizarCorreo(correo) },
    });
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
}
