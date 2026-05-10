import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { ActualizarEstadoOrdenTrabajoDto } from './dto/actualizar-estado-orden-trabajo.dto';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import { OrdenesTrabajoFacade } from './ordenes-trabajo.facade';

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(private readonly facade: OrdenesTrabajoFacade) {}

  @Get()
  buscarTodas(): Promise<OrdenTrabajoRespuestaDto[]> {
    return this.facade.obtenerOrdenes();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<OrdenTrabajoRespuestaDto> {
    return this.facade.obtenerOrden(id);
  }

  @Post()
  crear(
    @Body() datosOrden: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.facade.crearOrden(datosOrden);
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizacion: ActualizarEstadoOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.facade.actualizarEstado(id, datosActualizacion.estado);
  }
}
