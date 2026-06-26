import type { RolUsuario } from '../usuario.entity';

export type UsuarioRespuestaDto = {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
};
