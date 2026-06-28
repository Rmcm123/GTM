import type { UsuarioRespuestaDto } from '../../usuarios/dto/usuario-respuesta.dto';

export type RespuestaAutenticacionDto = {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioRespuestaDto;
};
