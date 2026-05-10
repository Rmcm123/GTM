import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import type { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import type { VehiculoRespuestaDto } from './dto/vehiculo-respuesta.dto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

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
