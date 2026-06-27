import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import type { ActualizarEstadoUsuarioDto } from './dto/actualizar-estado-usuario.dto';
import type { CrearUsuarioDto } from './dto/crear-usuario.dto';
import type { UsuarioRespuestaDto } from './dto/usuario-respuesta.dto';
import { RolUsuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.Administrador)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  buscarTodos(): Promise<UsuarioRespuestaDto[]> {
    return this.usuariosService.buscarTodos();
  }

  @Roles(RolUsuario.Administrador, RolUsuario.Recepcionista)
  @Get('mecanicos')
  buscarMecanicos(): Promise<UsuarioRespuestaDto[]> {
    return this.usuariosService.buscarMecanicosActivos();
  }

  @Post()
  crear(@Body() datosUsuario: CrearUsuarioDto): Promise<UsuarioRespuestaDto> {
    return this.usuariosService.crear(datosUsuario);
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id') id: string,
    @Body() datosEstado: ActualizarEstadoUsuarioDto,
  ): Promise<UsuarioRespuestaDto> {
    return this.usuariosService.actualizarEstado(id, datosEstado.activo);
  }
}
