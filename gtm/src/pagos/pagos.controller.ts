import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import type { PagoRespuestaDto } from './dto/pago-respuesta.dto';
import type { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { PagosService } from './pagos.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.Recepcionista)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get('orden/:ordenTrabajoId')
  buscarPorOrden(
    @Param('ordenTrabajoId', ParseIntPipe) ordenTrabajoId: number,
  ): Promise<PagoRespuestaDto[]> {
    return this.pagosService.buscarPorOrden(ordenTrabajoId);
  }

  @Post()
  registrar(@Body() datosPago: RegistrarPagoDto): Promise<PagoRespuestaDto> {
    return this.pagosService.registrar(datosPago);
  }
}
