import { Controller, Get, Param } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { VehiculoRespuestaDto } from './dto/vehiculo-respuesta.dto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get('cliente/:cliente_id')
  buscarPorCliente(
    @Param('cliente_id') cliente_id: string,
  ): Promise<VehiculoRespuestaDto[]> {
    return this.vehiculosService.buscarPorCliente(cliente_id);
  }

  @Get('patente/:patente')
  buscarPorPatente(
    @Param('patente') patente: string,
  ): Promise<VehiculoRespuestaDto | null> {
    return this.vehiculosService.buscarPorPatente(patente);
  }
}