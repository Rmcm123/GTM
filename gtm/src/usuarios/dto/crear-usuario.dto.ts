import type { RolUsuario } from '../usuario.entity';

export type CrearUsuarioDto = {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
};
