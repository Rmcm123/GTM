import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import { VehiculosService } from './vehiculos.service';
import type { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import type { VehiculoRespuestaDto } from './dto/vehiculo-respuesta.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.Recepcionista)
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  buscarTodos(): Promise<VehiculoRespuestaDto[]> {
    return this.vehiculosService.buscarTodos();
  }

  @Get('cliente/:clienteId')
  buscarPorCliente(
    @Param('clienteId') clienteId: string,
  ): Promise<VehiculoRespuestaDto[]> {
    return this.vehiculosService.buscarPorCliente(clienteId);
  }

  @Get('cliente-rut/:rutCliente')
  buscarPorRutCliente(
    @Param('rutCliente') rutCliente: string,
  ): Promise<VehiculoRespuestaDto[]> {
    return this.vehiculosService.buscarPorRutCliente(rutCliente);
  }

  @Get('patente/:patente')
  buscarPorPatente(
    @Param('patente') patente: string,
  ): Promise<VehiculoRespuestaDto | null> {
    return this.vehiculosService.buscarPorPatente(patente);
  }

  @Post()
  crear(
    @Body() datosVehiculo: CrearVehiculoDto,
  ): Promise<VehiculoRespuestaDto> {
    return this.vehiculosService.crear(datosVehiculo);
  }
}
