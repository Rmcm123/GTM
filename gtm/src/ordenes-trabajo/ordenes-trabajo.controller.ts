import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import type { ActualizarEstadoOrdenTrabajoDto } from './dto/actualizar-estado-orden-trabajo.dto';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import { OrdenesTrabajoFacade } from './ordenes-trabajo.facade';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(private readonly facade: OrdenesTrabajoFacade) {}

  @Roles(
    RolUsuario.Administrador,
    RolUsuario.Recepcionista,
    RolUsuario.Mecanico,
  )
  @Get()
  buscarTodas(): Promise<OrdenTrabajoRespuestaDto[]> {
    return this.facade.obtenerOrdenes();
  }

  @Roles(
    RolUsuario.Administrador,
    RolUsuario.Recepcionista,
    RolUsuario.Mecanico,
  )
  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.facade.obtenerOrden(id);
  }

  @Roles(RolUsuario.Administrador, RolUsuario.Recepcionista)
  @Post()
  crear(
    @Body() datosOrden: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.facade.crearOrden(datosOrden);
  }

  @Roles(
    RolUsuario.Administrador,
    RolUsuario.Recepcionista,
    RolUsuario.Mecanico,
  )
  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizacion: ActualizarEstadoOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.facade.actualizarEstado(id, datosActualizacion.estado);
  }
}
