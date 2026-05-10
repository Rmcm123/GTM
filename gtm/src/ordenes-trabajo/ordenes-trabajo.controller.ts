import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import type { CrearOrdenTrabajoDto } from './dto/crear-orden-trabajo.dto';
import type { OrdenTrabajoRespuestaDto } from './dto/orden-trabajo-respuesta.dto';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(private readonly ordenesTrabajoService: OrdenesTrabajoService) {}

  @Get()
  buscarTodas(): Promise<OrdenTrabajoRespuestaDto[]> {
    return this.ordenesTrabajoService.buscarTodas();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesTrabajoService.buscarPorId(id);
  }

  @Post()
  crear(
    @Body() datosOrden: CrearOrdenTrabajoDto,
  ): Promise<OrdenTrabajoRespuestaDto> {
    return this.ordenesTrabajoService.crear(datosOrden);
  }
}
